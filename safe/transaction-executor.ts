#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import { AnvilConfig, AnvilManager } from './anvil-manager';
import { ErrorCode, SafeTransactionError } from './errors';
import { logger } from './logger';
import { SafeManager } from './safe-manager';
import {
    convertHexToDecimal,
    getBroadcastFilePath,
    getChainIdFromRpc,
    parseEnvironmentVariables,
    readJsonFile,
    sleep,
    toChecksumAddress,
} from './utils/utils';
import { Validator } from './validation';
import { DEFAULTS, FORGE_COMMAND, TRANSACTION_TYPES } from './constants/transaction-executor.constants';
import type {
    BroadcastFile,
    BroadcastTransaction,
    ExecutionConfig,
    ForgeCommandResult,
    TransactionInput,
} from './types/transaction-executor.types';
import { TransactionConsoleUtils } from './utils/transaction-executor.console.utils';

export class TransactionExecutor {
    private safeManager: SafeManager;
    private anvilManager: AnvilManager;

    private constructor(safeManager: SafeManager) {
        this.safeManager = safeManager;
        this.anvilManager = new AnvilManager();
    }
    /**
     * Static factory method to create and initialize TransactionExecutor
     */
    static async create(): Promise<TransactionExecutor> {
        const safeManager = await SafeManager.create();
        return new TransactionExecutor(safeManager);
    }

    /**
     * Execute transactions from Foundry script with automatic broadcast generation
     */
    async executeFromScript(config: ExecutionConfig): Promise<string[]> {
        logger.info('Starting script execution', {
            forgeScript: config.forgeScript,
            smartContract: config.smartContract,
            hasEnvVars: !!config.envVars,
            dryRun: config.dryRun,
        });

        // Validate execution configuration
        this.validateExecutionConfig(config);

        try {
            TransactionConsoleUtils.displayExecutionStart(config);

            const chainId = await this.runFoundryScript(config);
            logger.info('Foundry script completed successfully', { chainId });
            TransactionConsoleUtils.displayExecutionSuccess();

            // Execute transactions from broadcast file
            return await this.processTransactionsFromBroadcast(config, chainId);
        } catch (error) {
            logger.error(
                'Foundry script execution failed, attempting fallback',
                error as Error,
            );
            TransactionConsoleUtils.displayFallbackAttempt(error);

            // Fallback: try to execute from existing broadcast file
            return await this.fallbackToBroadcastFile(config);
        }
    }

    /**
     * Validate execution configuration
     */
    private validateExecutionConfig(config: ExecutionConfig): void {
        if (!config.forgeScript && !config.envVars && !config.smartContract) {
            throw new SafeTransactionError(
                'Either forgeScript, envVars, or smartContract configuration is required',
                ErrorCode.INVALID_CONFIGURATION,
                { config },
            );
        }

        if (config.rpcUrl) {
            Validator.validateRpcUrl(config.rpcUrl);
        }
    }

    /**
     * Setup Anvil fork if needed
     */
    private async setupAnvilFork(config: ExecutionConfig): Promise<AnvilConfig | undefined> {
        if (!AnvilManager.shouldStartFork(config.rpcUrl, false)) {
            return undefined;
        }

        const anvilAvailable = await this.anvilManager.checkAvailability();
        TransactionConsoleUtils.displayAnvilStatus(anvilAvailable);

        if (!anvilAvailable) {
            return undefined;
        }

        // Extract sender addresses from forge options to unlock them
        const sendersToUnlock = AnvilManager.extractSenderFromForgeOptions(config.forgeOptions);

        const anvilConfig: AnvilConfig = {
            forkUrl: config.rpcUrl,
            port: undefined,
            host: undefined,
            unlockAccounts: sendersToUnlock,
        };

        await this.anvilManager.startFork(anvilConfig);
        // Wait for Anvil to start and accounts to be funded
        await sleep(DEFAULTS.ANVIL_STARTUP_DELAY);

        return anvilConfig;
    }

    /**
     * Build forge script command arguments
     */
    private buildForgeScriptCommand(
        config: ExecutionConfig,
        forgeRpcUrl: string,
    ): ForgeCommandResult {
        // Build forge script command
        const scriptPath = config.forgeScript || DEFAULTS.SCRIPT_PATH;

        // Extract contract name from script path if smartContract is not provided
        let contractName = config.smartContract;
        if (!contractName) {
            // Extract filename without extension and remove .s suffix
            const filename = scriptPath.split('/').pop() || '';
            contractName = filename.replace(/\.s\.sol$/, '').replace(/\.sol$/, '');
        }

        const forgeScript = `${scriptPath}:${contractName}`;
        const args: string[] = [
            FORGE_COMMAND.SUBCOMMAND,
            forgeScript,
            FORGE_COMMAND.FLAGS.RPC_URL,
            forgeRpcUrl,
            FORGE_COMMAND.FLAGS.BROADCAST,
            FORGE_COMMAND.FLAGS.VERBOSE,
        ];

        // Add forge options if provided
        if (config.forgeOptions) {
            const options = config.forgeOptions.trim().split(/\s+/);
            args.push(...options);
        }

        return { 
            command: FORGE_COMMAND.COMMAND, 
            args, 
            contractName, 
            scriptPath, 
            forgeScript 
        };
    }

    /**
     * Handle forge process events
     */
    private handleForgeProcess(
        childProcess: import('child_process').ChildProcess,
        config: ExecutionConfig,
        resolve: (value: string) => void,
        reject: (reason?: Error) => void,
    ): void {
        childProcess.on('close', (code: number) => {
            console.log(`Forge process completed with exit code: ${code}`);

            // Clean up Anvil process
            this.anvilManager.stop();

            if (code === 0) {
                console.log('Forge script executed successfully, fetching chain ID...');
                getChainIdFromRpc(config.rpcUrl)
                    .then((chainId) => {
                        console.log('Chain ID obtained:', chainId);
                        resolve(chainId);
                    })
                    .catch((error) => {
                        console.error('Error getting chain ID:', error);
                        reject(new Error(`Error getting chain ID: ${String(error)}`));
                    });
            } else {
                const errorMsg = `Forge process exited with code ${code}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
            }
        });

        childProcess.on('error', (error: Error) => {
            console.error('Forge process error:', error);
            // Clean up Anvil process on error
            this.anvilManager.stopOnError();
            reject(error);
        });
    }

    /**
     * Process transactions from broadcast file
     */
    private async processTransactionsFromBroadcast(
        config: ExecutionConfig,
        chainId: string,
    ): Promise<string[]> {
        logger.info('Processing transactions from broadcast file...');

        // Extract contract name from script path for consistent naming
        let defaultScriptName: string = DEFAULTS.SCRIPT_NAME;
        if (!config.scriptName) {
            const scriptPath = config.forgeScript || DEFAULTS.SCRIPT_PATH;
            const filename = scriptPath.split('/').pop() || '';
            defaultScriptName = filename.replace(/\.s\.sol$/, '').replace(/\.sol$/, '');
        }

        const scriptName = config.scriptName || defaultScriptName;
        console.log('Using script name for broadcast file:', scriptName);

        const transactions = this.readBroadcastFile(scriptName, chainId);

        if (transactions.length === 0) {
            logger.warn('No transactions found in broadcast file', { scriptName, chainId });
            return [];
        }

        logger.info(`Found ${transactions.length} transactions in broadcast file`, {
            scriptName,
            chainId,
            transactionCount: transactions.length,
        });

        // Validate and convert broadcast transactions to transaction inputs
        // Get one of the Safe owners to use as the 'from' address
        const safeOwners = await this.safeManager.getSafeOwners();
        if (safeOwners.length === 0) {
            throw new SafeTransactionError(
                'No owners found for the Safe',
                ErrorCode.INVALID_CONFIGURATION,
                { safeAddress: this.safeManager.getSafeAddress() },
            );
        }

        // Use the first owner as the 'from' address
        const fromAddress = safeOwners[0];
        console.log(`Using Safe owner as from address: ${fromAddress}`);

        const transactionInputs = transactions.map((tx, index) => {
            try {
                const txInput: TransactionInput = {
                    to: toChecksumAddress(tx.transaction.to),
                    from: fromAddress, // Use one of the Safe owners
                    value: convertHexToDecimal(tx.transaction.value),
                    data: tx.transaction.input,
                    operation: 'call' as const,
                };

                // Validate transaction data
                Validator.validateTransactionData(txInput);
                return txInput;
            } catch (error) {
                throw new SafeTransactionError(
                    `Invalid transaction data at index ${index}`,
                    ErrorCode.INVALID_TRANSACTION_DATA,
                    { index, transaction: tx, error: error },
                );
            }
        });

        return await this.executeTransactions(transactionInputs, config.dryRun);
    }

    /**
     * Fallback to existing broadcast file
     */
    private async fallbackToBroadcastFile(config: ExecutionConfig): Promise<string[]> {
        logger.info('Attempting fallback to existing broadcast file...');

        try {
            const chainId = await getChainIdFromRpc(config.rpcUrl);
            return await this.processTransactionsFromBroadcast(config, chainId);
        } catch (error) {
            logger.error('Fallback to broadcast file failed', error as Error);
            throw new SafeTransactionError(
                'Both Foundry script execution and broadcast file fallback failed',
                ErrorCode.SAFE_TRANSACTION_FAILED,
                { originalError: error },
            );
        }
    }

    /**
     * Execute multiple transactions with proper nonce management
     */
    async executeTransactions(
        transactions: TransactionInput[],
        dryRun: boolean = false,
    ): Promise<string[]> {
        if (transactions.length === 0) {
            console.log('No transactions to execute');
            return [];
        }

        console.log(`${dryRun ? 'Dry run: ' : ''}Executing ${transactions.length} transaction(s)`);

        if (dryRun) {
            TransactionConsoleUtils.displayDryRunTransactions(transactions);
            return [];
        }

        // Convert transaction inputs to MetaTransactionData
        const transactionsData = transactions.map((tx) =>
            tx.operation === 'delegatecall'
                ? this.safeManager.createDelegateCallTransaction(tx.to, tx.data)
                : this.safeManager.createContractCallTransaction(tx.to, tx.data, tx.value),
        );

        // Display transaction details
        TransactionConsoleUtils.displayTransactionDetails(transactions);

        console.log('\nProposing transactions with sequential nonces...');

        try {
            // Try using the new sequential nonce method
            const proposedHashes =
                await this.safeManager.proposeTransactionsWithSequentialNonces(transactionsData);

            TransactionConsoleUtils.displayTransactionHashes(proposedHashes);
            return proposedHashes;
        } catch (error) {
            console.error('Sequential nonce method failed:', error);
            console.log('Falling back to individual transaction proposal...');

            // Fallback to individual transaction proposal
            const proposedHashes: string[] = [];

            for (let i = 0; i < transactionsData.length; i++) {
                TransactionConsoleUtils.displayTransactionProgress(
                    i + 1, 
                    transactionsData.length, 
                    true
                );

                try {
                    const hash = await this.safeManager.proposeTransaction(transactionsData[i]);
                    proposedHashes.push(hash);
                    TransactionConsoleUtils.displayTransactionSuccess(hash);

                    // Small delay between transactions
                    if (i < transactionsData.length - 1) {
                        await sleep(DEFAULTS.TRANSACTION_DELAY);
                    }
                } catch (individualError) {
                    TransactionConsoleUtils.displayTransactionFailure(i + 1, individualError);
                    throw individualError;
                }
            }

            TransactionConsoleUtils.displayTransactionHashes(proposedHashes, 'fallback method');
            return proposedHashes;
        }
    }

    /**
     * Run the Foundry script and return the chain ID
     */
    private async runFoundryScript(config: ExecutionConfig): Promise<string> {
        let anvilConfig: AnvilConfig | undefined;

        try {
            // Start Anvil fork if needed
            anvilConfig = await this.setupAnvilFork(config);

            return new Promise((resolve, reject) => {
                const env = { ...process.env };

                // Determine the RPC URL to use for forge script
                const forgeRpcUrl = AnvilManager.getForgeRpcUrl(
                    config.rpcUrl,
                    this.anvilManager.isRunning(),
                    anvilConfig,
                );

                // Build forge script command
                const { command, args, contractName, scriptPath, forgeScript } =
                    this.buildForgeScriptCommand(config, forgeRpcUrl);

                // Set environment variables for the forge script
                if (config.envVars) {
                    const parsedEnvVars = parseEnvironmentVariables(config.envVars);
                    Object.assign(env, parsedEnvVars);
                }

                TransactionConsoleUtils.displayForgeCommand(
                    command, 
                    args, 
                    scriptPath, 
                    contractName, 
                    forgeScript, 
                    config.forgeOptions
                );

                const childProcess = spawn(command, args, {
                    cwd: process.cwd(),
                    stdio: 'inherit',
                    env,
                });

                this.handleForgeProcess(childProcess, config, resolve, reject);
            });
        } catch (error) {
            // Clean up Anvil process if fork startup failed
            this.anvilManager.stopOnError();
            throw error;
        }
    }

    /**
     * Read the broadcast file and extract transactions
     */
    private readBroadcastFile(scriptName: string, chainId: string): BroadcastTransaction[] {
        const broadcastPath = getBroadcastFilePath(scriptName, chainId);
        console.log('Reading broadcast file from:', broadcastPath);

        try {
            const broadcastData: BroadcastFile = readJsonFile(broadcastPath);
            
            // Filter for CALL transactions only (deployments and other types should be excluded)
            const callTransactions = broadcastData.transactions.filter(
                (tx) => tx.transactionType === TRANSACTION_TYPES.CALL,
            );
            
            TransactionConsoleUtils.displayBroadcastInfo(
                scriptName,
                broadcastData.transactions.length,
                callTransactions.length,
            );

            return callTransactions;
        } catch (error) {
            console.error('Error reading broadcast file:', error);
            throw new SafeTransactionError(
                `Failed to read broadcast file: ${broadcastPath}`,
                ErrorCode.SAFE_TRANSACTION_FAILED,
                { scriptName, chainId, error },
            );
        }
    }

    /**
     * Get the current nonce for the Safe
     */
    async getCurrentNonce(): Promise<number> {
        return await this.safeManager.getCurrentNonce();
    }
}
