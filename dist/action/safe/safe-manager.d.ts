import { MetaTransactionData } from '@safe-global/types-kit';
export declare class SafeManager {
    private apiKit;
    private safeConfig;
    private constructor();
    static create(): Promise<SafeManager>;
    /**
     * Create a Protocol Kit instance for a specific owner
     */
    private createProtocolKit;
    /**
     * Propose a transaction to the Safe
     */
    proposeTransaction(transactionData: MetaTransactionData): Promise<string>;
    /**
     * Helper method to create a contract call transaction
     */
    createContractCallTransaction(to: string, data: string, value?: string): MetaTransactionData;
    /**
     * Helper method to create a delegate call transaction
     */
    createDelegateCallTransaction(to: string, data: string): MetaTransactionData;
    /**
     * Get the current nonce for the Safe
     */
    getCurrentNonce(): Promise<number>;
    /**
     * Get Safe information including owners (internal helper)
     */
    private getSafeInfo;
    /**
     * Get all owners of the Safe
     */
    getSafeOwners(): Promise<string[]>;
    /**
     * Get the Safe address
     */
    getSafeAddress(): string;
    /**
     * Propose a transaction to the Safe with explicit nonce
     */
    proposeTransactionWithNonce(transactionData: MetaTransactionData, nonce: number): Promise<string>;
    /**
     * Handle errors from propose transaction operations
     */
    private handleProposeTransactionError;
    /**
     * Extract detailed error information for logging
     */
    private extractErrorDetails;
    /**
     * Propose multiple transactions with sequential nonces
     */
    proposeTransactionsWithSequentialNonces(transactionsData: MetaTransactionData[]): Promise<string[]>;
}
//# sourceMappingURL=safe-manager.d.ts.map