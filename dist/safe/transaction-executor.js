#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionExecutor = void 0;
const child_process_1 = require("child_process");
const anvil_manager_1 = require("./anvil-manager");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const safe_manager_1 = require("./safe-manager");
const utils_1 = require("./utils/utils");
const validation_1 = require("./validation");
const transaction_executor_constants_1 = require("./constants/transaction-executor.constants");
const transaction_executor_console_utils_1 = require("./utils/transaction-executor.console.utils");
class TransactionExecutor {
    constructor(safeManager) {
        this.safeManager = safeManager;
        this.anvilManager = new anvil_manager_1.AnvilManager();
    }
    /**
     * Static factory method to create and initialize TransactionExecutor
     */
    static async create() {
        const safeManager = await safe_manager_1.SafeManager.create();
        return new TransactionExecutor(safeManager);
    }
    /**
     * Execute transactions from Foundry script with automatic broadcast generation
     */
    async executeFromScript(config) {
        logger_1.logger.info('Starting script execution', {
            forgeScript: config.forgeScript,
            smartContract: config.smartContract,
            hasEnvVars: !!config.envVars,
            dryRun: config.dryRun,
        });
        // Validate execution configuration
        this.validateExecutionConfig(config);
        try {
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayExecutionStart(config);
            const chainId = await this.runFoundryScript(config);
            logger_1.logger.info('Foundry script completed successfully', { chainId });
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayExecutionSuccess();
            // Execute transactions from broadcast file
            return await this.processTransactionsFromBroadcast(config, chainId);
        }
        catch (error) {
            logger_1.logger.error('Foundry script execution failed, attempting fallback', error);
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayFallbackAttempt(error);
            // Fallback: try to execute from existing broadcast file
            return await this.fallbackToBroadcastFile(config);
        }
    }
    /**
     * Validate execution configuration
     */
    validateExecutionConfig(config) {
        if (!config.forgeScript && !config.envVars && !config.smartContract) {
            throw new errors_1.SafeTransactionError('Either forgeScript, envVars, or smartContract configuration is required', errors_1.ErrorCode.INVALID_CONFIGURATION, { config });
        }
        if (config.rpcUrl) {
            validation_1.Validator.validateRpcUrl(config.rpcUrl);
        }
    }
    /**
     * Setup Anvil fork if needed
     */
    async setupAnvilFork(config) {
        if (!anvil_manager_1.AnvilManager.shouldStartFork(config.rpcUrl, false)) {
            return undefined;
        }
        const anvilAvailable = await this.anvilManager.checkAvailability();
        transaction_executor_console_utils_1.TransactionConsoleUtils.displayAnvilStatus(anvilAvailable);
        if (!anvilAvailable) {
            return undefined;
        }
        // Get Safe address directly from the SafeManager
        const safeAddress = this.safeManager.getSafeAddress();
        const anvilConfig = {
            forkUrl: config.rpcUrl,
            port: undefined,
            host: undefined,
            unlockAccount: safeAddress,
        };
        await this.anvilManager.startFork(anvilConfig);
        // Wait for Anvil to start and accounts to be funded
        await (0, utils_1.sleep)(transaction_executor_constants_1.DEFAULTS.ANVIL_STARTUP_DELAY);
        return anvilConfig;
    }
    /**
     * Build forge script command arguments
     */
    buildForgeScriptCommand(config, forgeRpcUrl) {
        // Build forge script command
        const scriptPath = config.forgeScript || transaction_executor_constants_1.DEFAULTS.SCRIPT_PATH;
        // Extract contract name from script path if smartContract is not provided
        let contractName = config.smartContract;
        if (!contractName) {
            // Extract filename without extension and remove .s suffix
            const filename = scriptPath.split('/').pop() || '';
            contractName = filename.replace(/\.s\.sol$/, '').replace(/\.sol$/, '');
        }
        const forgeScript = `${scriptPath}:${contractName}`;
        const args = [
            transaction_executor_constants_1.FORGE_COMMAND.SUBCOMMAND,
            forgeScript,
            transaction_executor_constants_1.FORGE_COMMAND.FLAGS.RPC_URL,
            forgeRpcUrl,
            transaction_executor_constants_1.FORGE_COMMAND.FLAGS.BROADCAST,
            transaction_executor_constants_1.FORGE_COMMAND.FLAGS.VERBOSE,
        ];
        // Add forge options if provided
        if (config.forgeOptions) {
            const options = config.forgeOptions.trim().split(/\s+/);
            args.push(...options);
        }
        return {
            command: transaction_executor_constants_1.FORGE_COMMAND.COMMAND,
            args,
            contractName,
            scriptPath,
            forgeScript
        };
    }
    /**
     * Handle forge process events
     */
    handleForgeProcess(childProcess, config, resolve, reject) {
        childProcess.on('close', (code) => {
            logger_1.logger.info(`Forge process completed with exit code: ${code}`);
            // Clean up Anvil process
            this.anvilManager.stop();
            if (code === 0) {
                logger_1.logger.info('Forge script executed successfully, fetching chain ID...');
                (0, utils_1.getChainIdFromRpc)(config.rpcUrl)
                    .then((chainId) => {
                    logger_1.logger.info('Chain ID obtained:', { chainId });
                    resolve(chainId);
                })
                    .catch((error) => {
                    logger_1.logger.error('Error getting chain ID:', error);
                    reject(new Error(`Error getting chain ID: ${String(error)}`));
                });
            }
            else {
                const errorMsg = `Forge process exited with code ${code}`;
                logger_1.logger.error(errorMsg);
                reject(new Error(errorMsg));
            }
        });
        childProcess.on('error', (error) => {
            logger_1.logger.error('Forge process error:', error);
            // Clean up Anvil process on error
            this.anvilManager.stopOnError();
            reject(error);
        });
    }
    /**
     * Process transactions from broadcast file
     */
    async processTransactionsFromBroadcast(config, chainId) {
        logger_1.logger.info('Processing transactions from broadcast file...');
        // Extract contract name from script path for consistent naming
        let defaultScriptName = transaction_executor_constants_1.DEFAULTS.SCRIPT_NAME;
        if (!config.scriptName) {
            const scriptPath = config.forgeScript || transaction_executor_constants_1.DEFAULTS.SCRIPT_PATH;
            const filename = scriptPath.split('/').pop() || '';
            defaultScriptName = filename.replace(/\.s\.sol$/, '').replace(/\.sol$/, '');
        }
        const scriptName = config.scriptName || defaultScriptName;
        logger_1.logger.info('Using script name for broadcast file:', { scriptName });
        const transactions = this.readBroadcastFile(scriptName, chainId);
        if (transactions.length === 0) {
            logger_1.logger.warn('No transactions found in broadcast file', { scriptName, chainId });
            return [];
        }
        logger_1.logger.info(`Found ${transactions.length} transactions in broadcast file`, {
            scriptName,
            chainId,
            transactionCount: transactions.length,
        });
        // Validate and convert broadcast transactions to transaction inputs
        const safeOwners = await this.safeManager.getSafeOwners();
        if (safeOwners.length === 0) {
            throw new errors_1.SafeTransactionError('No owners found for the Safe', errors_1.ErrorCode.INVALID_CONFIGURATION, { safeAddress: this.safeManager.getSafeAddress() });
        }
        // Use the first owner as the 'from' address
        const fromAddress = safeOwners[0];
        logger_1.logger.info('Using Safe owner as from address:', { fromAddress });
        const transactionInputs = transactions.map((tx, index) => {
            try {
                const txInput = {
                    to: (0, utils_1.toChecksumAddress)(tx.transaction.to),
                    from: fromAddress, // Use one of the Safe owners
                    value: (0, utils_1.convertHexToDecimal)(tx.transaction.value),
                    data: tx.transaction.input,
                    operation: 'call',
                };
                // Validate transaction data
                validation_1.Validator.validateTransactionData(txInput);
                return txInput;
            }
            catch (error) {
                throw new errors_1.SafeTransactionError(`Invalid transaction data at index ${index}`, errors_1.ErrorCode.INVALID_TRANSACTION_DATA, { index, transaction: tx, error: error });
            }
        });
        return await this.executeTransactions(transactionInputs, config.dryRun);
    }
    /**
     * Fallback to existing broadcast file
     */
    async fallbackToBroadcastFile(config) {
        logger_1.logger.info('Attempting fallback to existing broadcast file...');
        try {
            const chainId = await (0, utils_1.getChainIdFromRpc)(config.rpcUrl);
            return await this.processTransactionsFromBroadcast(config, chainId);
        }
        catch (error) {
            logger_1.logger.error('Fallback to broadcast file failed', error);
            throw new errors_1.SafeTransactionError('Both Foundry script execution and broadcast file fallback failed', errors_1.ErrorCode.SAFE_TRANSACTION_FAILED, { originalError: error });
        }
    }
    /**
     * Execute multiple transactions with proper nonce management
     */
    async executeTransactions(transactions, dryRun = false) {
        if (transactions.length === 0) {
            logger_1.logger.info('No transactions to execute');
            return [];
        }
        logger_1.logger.info(`${dryRun ? 'Dry run: ' : ''}Executing ${transactions.length} transaction(s)`);
        if (dryRun) {
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayDryRunTransactions(transactions);
            return [];
        }
        // Convert transaction inputs to MetaTransactionData
        const transactionsData = transactions.map((tx) => tx.operation === 'delegatecall'
            ? this.safeManager.createDelegateCallTransaction(tx.to, tx.data)
            : this.safeManager.createContractCallTransaction(tx.to, tx.data, tx.value));
        // Display transaction details
        transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionDetails(transactions);
        logger_1.logger.info('Proposing transactions with sequential nonces...');
        try {
            // Try using the new sequential nonce method
            const proposedHashes = await this.safeManager.proposeTransactionsWithSequentialNonces(transactionsData);
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionHashes(proposedHashes);
            return proposedHashes;
        }
        catch (error) {
            logger_1.logger.error('Sequential nonce method failed:', error);
            logger_1.logger.info('Falling back to individual transaction proposal...');
            return await this.executeTransactionsIndividually(transactionsData);
        }
    }
    /**
     * Execute transactions individually as fallback
     */
    async executeTransactionsIndividually(transactionsData) {
        const proposedHashes = [];
        for (let i = 0; i < transactionsData.length; i++) {
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionProgress(i + 1, transactionsData.length, true);
            try {
                const hash = await this.safeManager.proposeTransaction(transactionsData[i]);
                proposedHashes.push(hash);
                transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionSuccess(hash);
                // Small delay between transactions
                if (i < transactionsData.length - 1) {
                    await (0, utils_1.sleep)(transaction_executor_constants_1.DEFAULTS.TRANSACTION_DELAY);
                }
            }
            catch (individualError) {
                transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionFailure(i + 1, individualError);
                throw individualError;
            }
        }
        transaction_executor_console_utils_1.TransactionConsoleUtils.displayTransactionHashes(proposedHashes, 'fallback method');
        return proposedHashes;
    }
    /**
     * Run the Foundry script and return the chain ID
     */
    async runFoundryScript(config) {
        let anvilConfig;
        try {
            // Start Anvil fork if needed
            anvilConfig = await this.setupAnvilFork(config);
            return new Promise((resolve, reject) => {
                const env = { ...process.env };
                // Determine the RPC URL to use for forge script
                const forgeRpcUrl = anvil_manager_1.AnvilManager.getForgeRpcUrl(config.rpcUrl, this.anvilManager.isRunning(), anvilConfig);
                // Build forge script command
                const { command, args, contractName, scriptPath, forgeScript } = this.buildForgeScriptCommand(config, forgeRpcUrl);
                // Set environment variables for the forge script
                if (config.envVars) {
                    const parsedEnvVars = (0, utils_1.parseEnvironmentVariables)(config.envVars);
                    Object.assign(env, parsedEnvVars);
                }
                transaction_executor_console_utils_1.TransactionConsoleUtils.displayForgeCommand(command, args, scriptPath, contractName, forgeScript, config.forgeOptions);
                const childProcess = (0, child_process_1.spawn)(command, args, {
                    cwd: process.cwd(),
                    stdio: 'inherit',
                    env,
                });
                this.handleForgeProcess(childProcess, config, resolve, reject);
            });
        }
        catch (error) {
            // Clean up Anvil process if fork startup failed
            this.anvilManager.stopOnError();
            throw error;
        }
    }
    /**
     * Read the broadcast file and extract transactions
     */
    readBroadcastFile(scriptName, chainId) {
        const broadcastPath = (0, utils_1.getBroadcastFilePath)(scriptName, chainId);
        logger_1.logger.info('Reading broadcast file from:', { broadcastPath });
        try {
            const broadcastData = (0, utils_1.readJsonFile)(broadcastPath);
            // Filter for CALL transactions only (deployments and other types should be excluded)
            const callTransactions = broadcastData.transactions.filter((tx) => tx.transactionType === transaction_executor_constants_1.TRANSACTION_TYPES.CALL);
            transaction_executor_console_utils_1.TransactionConsoleUtils.displayBroadcastInfo(scriptName, broadcastData.transactions.length, callTransactions.length);
            return callTransactions;
        }
        catch (error) {
            logger_1.logger.error('Error reading broadcast file:', error);
            throw new errors_1.SafeTransactionError(`Failed to read broadcast file: ${broadcastPath}`, errors_1.ErrorCode.SAFE_TRANSACTION_FAILED, { scriptName, chainId, error });
        }
    }
}
exports.TransactionExecutor = TransactionExecutor;
//# sourceMappingURL=transaction-executor.js.map