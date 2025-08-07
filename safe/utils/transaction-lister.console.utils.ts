/**
 * Console utilities for TransactionLister display formatting
 */

import { formatDate, formatWeiToEther, truncateData } from './utils';
import { CLI_HELP_TEXT, EXECUTION_STATUS, TRANSACTION_TYPES, DISPLAY_VALUES } from '../constants/transaction-lister.constants';
import type { TransactionResult } from '../types/transaction-lister.types';

export class ListPendingConsoleUtils {
    /**
     * Display transaction details
     */
    static displayTransaction(tx: TransactionResult, index: number): void {
        console.log(`Transaction ${index + 1}:`);
        console.log(`   Hash: ${tx.safeTxHash || DISPLAY_VALUES.NOT_AVAILABLE}`);
        console.log(`   To: ${tx.to || DISPLAY_VALUES.NOT_AVAILABLE}`);
        console.log(`   Value: ${formatWeiToEther(tx.value || '0')} ETH (${tx.value || '0'} wei)`);
        console.log(`   Data: ${truncateData(tx.data ?? '')}`);
        console.log(
            `   Confirmations: ${tx.confirmations?.length || 0}/${tx.confirmationsRequired || DISPLAY_VALUES.NOT_AVAILABLE}`,
        );

        const isExecutable = this.determineExecutionStatus(tx);
        console.log(`   Executable: ${isExecutable}`);
        console.log(`   Submission Date: ${formatDate(tx.submissionDate || '')}`);

        this.displayConfirmations(tx.confirmations);
        console.log('');
    }

    /**
     * Display transaction confirmations
     */
    static displayConfirmations(confirmations?: Array<{ owner?: string }>): void {
        if (confirmations && confirmations.length > 0) {
            console.log(`   Confirmed by:`);
            confirmations.forEach((confirmation) => {
                console.log(`     - ${confirmation.owner || DISPLAY_VALUES.UNKNOWN_OWNER}`);
            });
        }
    }

    /**
     * Determine execution status of transaction
     */
    static determineExecutionStatus(tx: TransactionResult): string {
        if (tx.isExecuted) {
            return EXECUTION_STATUS.EXECUTED;
        }

        const confirmationsCount = tx.confirmations?.length || 0;
        const requiredConfirmations = tx.confirmationsRequired || 0;

        return confirmationsCount >= requiredConfirmations ? EXECUTION_STATUS.READY : EXECUTION_STATUS.PENDING;
    }

    /**
     * Display transactions summary
     */
    static displayTransactionsSummary(
        results: TransactionResult[],
        transactionsToShow: TransactionResult[],
        transactions: { count?: number },
        transactionType: string,
        limit: number,
    ): void {
        console.log(
            `Found ${results.length} ${transactionType} transaction(s) (showing ${transactionsToShow.length}):`,
        );
        console.log('');

        transactionsToShow.forEach((tx, index) => this.displayTransaction(tx, index));

        if (results.length > limit) {
            console.log(`... and ${results.length - limit} more transaction(s).`);
            console.log(`Use --limit ${results.length} to see all transactions.`);
        }

        console.log(`Total count: ${transactions.count || results.length}`);

        if (transactionType === TRANSACTION_TYPES.PENDING && transactionsToShow.length > 0) {
            console.log('');
            console.log('To confirm pending transactions, use the Safe web interface');
            console.log(`   Visit: ${DISPLAY_VALUES.SAFE_WEB_URL}`);
        }
    }

    /**
     * Display fetching status
     */
    static displayFetchingStatus(transactionType: string): void {
        console.log(`Fetching ${transactionType} transactions...`);
        console.log('');
    }

    /**
     * Display no transactions found message
     */
    static displayNoTransactionsFound(transactionType: string): void {
        console.log(`No ${transactionType} transactions found.`);
    }

    /**
     * Display help text
     */
    static displayHelp(): void {
        console.log(CLI_HELP_TEXT);
    }

    /**
     * Display error message
     */
    static displayError(message: string, error?: unknown): void {
        console.error(`Error: ${message}`, error);
    }
}
