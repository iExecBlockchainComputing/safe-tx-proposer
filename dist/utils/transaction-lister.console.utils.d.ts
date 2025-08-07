/**
 * Console utilities for TransactionLister display formatting
 */
import type { TransactionResult } from '../types/transaction-lister.types';
export declare class ListPendingConsoleUtils {
    /**
     * Display transaction details
     */
    static displayTransaction(tx: TransactionResult, index: number): void;
    /**
     * Display transaction confirmations
     */
    static displayConfirmations(confirmations?: Array<{
        owner?: string;
    }>): void;
    /**
     * Determine execution status of transaction
     */
    static determineExecutionStatus(tx: TransactionResult): string;
    /**
     * Display transactions summary
     */
    static displayTransactionsSummary(results: TransactionResult[], transactionsToShow: TransactionResult[], transactions: {
        count?: number;
    }, transactionType: string, limit: number): void;
    /**
     * Display fetching status
     */
    static displayFetchingStatus(transactionType: string): void;
    /**
     * Display no transactions found message
     */
    static displayNoTransactionsFound(transactionType: string): void;
    /**
     * Display help text
     */
    static displayHelp(): void;
    /**
     * Display error message
     */
    static displayError(message: string, error?: unknown): void;
}
//# sourceMappingURL=transaction-lister.console.utils.d.ts.map