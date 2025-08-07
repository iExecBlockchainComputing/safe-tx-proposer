#!/usr/bin/env ts-node

import { SafeManager } from './safe-manager';
import { logger } from './logger';
import { SafeTransactionError, ErrorCode } from './errors';
import { DEFAULTS, TRANSACTION_TYPES } from './constants/transaction-lister.constants';
import type {
    ListPendingArgs,
    ListPendingConfig,
    TransactionResult,
    TransactionResponse,
    TransactionType,
} from './types/transaction-lister.types';
import { ListPendingConsoleUtils } from './utils/transaction-lister.console.utils';

export class TransactionLister {
    private safeManager: SafeManager;

    private constructor(safeManager: SafeManager) {
        this.safeManager = safeManager;
    }

    /**
     * Static factory method to create and initialize TransactionLister
     */
    static async create(): Promise<TransactionLister> {
        const safeManager = await SafeManager.create();
        return new TransactionLister(safeManager);
    }

    /**
     * List transactions based on configuration
     */
    async listTransactions(config: ListPendingConfig): Promise<TransactionResult[]> {
        logger.info('Starting transaction listing', {
            type: config.type,
            limit: config.limit,
        });

        // Validate configuration
        this.validateConfig(config);

        try {
            ListPendingConsoleUtils.displayFetchingStatus(config.type);

            const transactions = await this.fetchTransactions(config.type);

            if (!transactions || !Array.isArray(transactions.results) || transactions.results.length === 0) {
                ListPendingConsoleUtils.displayNoTransactionsFound(config.type);
                return [];
            }

            const results = transactions.results as TransactionResult[];
            const transactionsToShow = results.slice(0, config.limit);

            ListPendingConsoleUtils.displayTransactionsSummary(
                results,
                transactionsToShow,
                transactions,
                config.type,
                config.limit,
            );

            logger.info('Transaction listing completed successfully', {
                totalFound: results.length,
                displayed: transactionsToShow.length,
            });

            return results;
        } catch (error) {
            logger.error('Transaction listing failed', error as Error);
            throw new SafeTransactionError(
                `Failed to list ${config.type} transactions`,
                ErrorCode.SAFE_TRANSACTION_FAILED,
                { config, error },
            );
        }
    }

    /**
     * Validate configuration
     */
    private validateConfig(config: ListPendingConfig): void {
        if (!config.type || !Object.values(TRANSACTION_TYPES).includes(config.type)) {
            throw new SafeTransactionError(
                `Invalid transaction type: ${config.type}`,
                ErrorCode.INVALID_CONFIGURATION,
                { config },
            );
        }

        if (config.limit < 0) {
            throw new SafeTransactionError(
                'Limit must be a non-negative number',
                ErrorCode.INVALID_CONFIGURATION,
                { config },
            );
        }
    }

    /**
     * Fetch transactions based on type
     */
    private async fetchTransactions(transactionType: TransactionType): Promise<TransactionResponse | undefined> {
        switch (transactionType) {
            case TRANSACTION_TYPES.PENDING:
                return await this.safeManager.getPendingTransactions();
            case TRANSACTION_TYPES.ALL:
                return await this.safeManager.getAllTransactions();
            case TRANSACTION_TYPES.INCOMING:
                return await this.safeManager.getIncomingTransactions();
            case TRANSACTION_TYPES.MULTISIG:
                return await this.safeManager.getMultisigTransactions();
            case TRANSACTION_TYPES.MODULE:
                return await this.safeManager.getModuleTransactions();
            default:
                throw new SafeTransactionError(
                    `Unknown transaction type: ${transactionType}`,
                    ErrorCode.INVALID_CONFIGURATION,
                    { transactionType },
                );
        }
    }

    /**
     * Parse command line arguments
     */
    static parseCommandLineArgs(): ListPendingArgs {
        const args = process.argv.slice(2);
        const parsedArgs: ListPendingArgs = {};

        for (let i = 0; i < args.length; i += 2) {
            const key = args[i];
            const value = args[i + 1];

            switch (key) {
                case '--type':
                    parsedArgs.type = value as TransactionType;
                    break;
                case '--limit':
                    parsedArgs.limit = value;
                    break;
                case '--help':
                    ListPendingConsoleUtils.displayHelp();
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
    static createConfig(args: ListPendingArgs): ListPendingConfig {
        return {
            type: args.type || DEFAULTS.TRANSACTION_TYPE,
            limit: args.limit ? parseInt(args.limit) : DEFAULTS.LIMIT,
        };
    }

    /**
     * Get Safe address
     */
    getSafeAddress(): string {
        return this.safeManager.getSafeAddress();
    }
}
