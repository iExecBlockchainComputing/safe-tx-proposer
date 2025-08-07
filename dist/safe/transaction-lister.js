#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionLister = void 0;
const safe_manager_1 = require("./safe-manager");
const logger_1 = require("./logger");
const errors_1 = require("./errors");
const transaction_lister_constants_1 = require("./constants/transaction-lister.constants");
const transaction_lister_console_utils_1 = require("./utils/transaction-lister.console.utils");
class TransactionLister {
    constructor(safeManager) {
        this.safeManager = safeManager;
    }
    /**
     * Static factory method to create and initialize TransactionLister
     */
    static async create() {
        const safeManager = await safe_manager_1.SafeManager.create();
        return new TransactionLister(safeManager);
    }
    /**
     * List transactions based on configuration
     */
    async listTransactions(config) {
        logger_1.logger.info('Starting transaction listing', {
            type: config.type,
            limit: config.limit,
        });
        // Validate configuration
        this.validateConfig(config);
        try {
            transaction_lister_console_utils_1.ListPendingConsoleUtils.displayFetchingStatus(config.type);
            const transactions = await this.fetchTransactions(config.type);
            if (!transactions || !Array.isArray(transactions.results) || transactions.results.length === 0) {
                transaction_lister_console_utils_1.ListPendingConsoleUtils.displayNoTransactionsFound(config.type);
                return [];
            }
            const results = transactions.results;
            const transactionsToShow = results.slice(0, config.limit);
            transaction_lister_console_utils_1.ListPendingConsoleUtils.displayTransactionsSummary(results, transactionsToShow, transactions, config.type, config.limit);
            logger_1.logger.info('Transaction listing completed successfully', {
                totalFound: results.length,
                displayed: transactionsToShow.length,
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error('Transaction listing failed', error);
            throw new errors_1.SafeTransactionError(`Failed to list ${config.type} transactions`, errors_1.ErrorCode.SAFE_TRANSACTION_FAILED, { config, error });
        }
    }
    /**
     * Validate configuration
     */
    validateConfig(config) {
        if (!config.type || !Object.values(transaction_lister_constants_1.TRANSACTION_TYPES).includes(config.type)) {
            throw new errors_1.SafeTransactionError(`Invalid transaction type: ${config.type}`, errors_1.ErrorCode.INVALID_CONFIGURATION, { config });
        }
        if (config.limit < 0) {
            throw new errors_1.SafeTransactionError('Limit must be a non-negative number', errors_1.ErrorCode.INVALID_CONFIGURATION, { config });
        }
    }
    /**
     * Fetch transactions based on type
     */
    async fetchTransactions(transactionType) {
        switch (transactionType) {
            case transaction_lister_constants_1.TRANSACTION_TYPES.PENDING:
                return await this.safeManager.getPendingTransactions();
            case transaction_lister_constants_1.TRANSACTION_TYPES.ALL:
                return await this.safeManager.getAllTransactions();
            case transaction_lister_constants_1.TRANSACTION_TYPES.INCOMING:
                return await this.safeManager.getIncomingTransactions();
            case transaction_lister_constants_1.TRANSACTION_TYPES.MULTISIG:
                return await this.safeManager.getMultisigTransactions();
            case transaction_lister_constants_1.TRANSACTION_TYPES.MODULE:
                return await this.safeManager.getModuleTransactions();
            default:
                throw new errors_1.SafeTransactionError(`Unknown transaction type: ${transactionType}`, errors_1.ErrorCode.INVALID_CONFIGURATION, { transactionType });
        }
    }
    /**
     * Parse command line arguments
     */
    static parseCommandLineArgs() {
        const args = process.argv.slice(2);
        const parsedArgs = {};
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i];
            const value = args[i + 1];
            switch (key) {
                case '--type':
                    parsedArgs.type = value;
                    break;
                case '--limit':
                    parsedArgs.limit = value;
                    break;
                case '--help':
                    transaction_lister_console_utils_1.ListPendingConsoleUtils.displayHelp();
                    process.exit(0);
                    break;
                default:
                    if (key.startsWith('--')) {
                        console.error(`Unknown argument: ${key}`);
                        process.exit(1);
                    }
            }
        }
        return parsedArgs;
    }
    /**
     * Create configuration from parsed arguments
     */
    static createConfig(args) {
        return {
            type: args.type || transaction_lister_constants_1.DEFAULTS.TRANSACTION_TYPE,
            limit: args.limit ? parseInt(args.limit) : transaction_lister_constants_1.DEFAULTS.LIMIT,
        };
    }
    /**
     * Get Safe address
     */
    getSafeAddress() {
        return this.safeManager.getSafeAddress();
    }
}
exports.TransactionLister = TransactionLister;
//# sourceMappingURL=transaction-lister.js.map