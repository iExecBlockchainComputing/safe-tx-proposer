#!/usr/bin/env ts-node
import type { ListPendingArgs, ListPendingConfig, TransactionResult } from './types/transaction-lister.types';
export declare class TransactionLister {
    private safeManager;
    private constructor();
    /**
     * Static factory method to create and initialize TransactionLister
     */
    static create(): Promise<TransactionLister>;
    /**
     * List transactions based on configuration
     */
    listTransactions(config: ListPendingConfig): Promise<TransactionResult[]>;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Fetch transactions based on type
     */
    private fetchTransactions;
    /**
     * Parse command line arguments
     */
    static parseCommandLineArgs(): ListPendingArgs;
    /**
     * Create configuration from parsed arguments
     */
    static createConfig(args: ListPendingArgs): ListPendingConfig;
    /**
     * Get Safe address
     */
    getSafeAddress(): string;
}
//# sourceMappingURL=transaction-lister.d.ts.map