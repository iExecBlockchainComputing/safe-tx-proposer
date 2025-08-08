"use strict";
/**
 * Console utilities for TransactionLister display formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPendingConsoleUtils = void 0;
const utils_1 = require("./utils");
const transaction_lister_constants_1 = require("../constants/transaction-lister.constants");
class ListPendingConsoleUtils {
    /**
     * Display transaction details
     */
    static displayTransaction(tx, index) {
        console.log(`Transaction ${index + 1}:`);
        console.log(`   Hash: ${tx.safeTxHash || transaction_lister_constants_1.DISPLAY_VALUES.NOT_AVAILABLE}`);
        console.log(`   To: ${tx.to || transaction_lister_constants_1.DISPLAY_VALUES.NOT_AVAILABLE}`);
        console.log(`   Value: ${(0, utils_1.formatWeiToEther)(tx.value || '0')} ETH (${tx.value || '0'} wei)`);
        console.log(`   Data: ${(0, utils_1.truncateData)(tx.data ?? '')}`);
        console.log(`   Confirmations: ${tx.confirmations?.length || 0}/${tx.confirmationsRequired || transaction_lister_constants_1.DISPLAY_VALUES.NOT_AVAILABLE}`);
        const isExecutable = this.determineExecutionStatus(tx);
        console.log(`   Executable: ${isExecutable}`);
        console.log(`   Submission Date: ${(0, utils_1.formatDate)(tx.submissionDate || '')}`);
        this.displayConfirmations(tx.confirmations);
        console.log('');
    }
    /**
     * Display transaction confirmations
     */
    static displayConfirmations(confirmations) {
        if (confirmations && confirmations.length > 0) {
            console.log(`   Confirmed by:`);
            confirmations.forEach((confirmation) => {
                console.log(`     - ${confirmation.owner || transaction_lister_constants_1.DISPLAY_VALUES.UNKNOWN_OWNER}`);
            });
        }
    }
    /**
     * Determine execution status of transaction
     */
    static determineExecutionStatus(tx) {
        if (tx.isExecuted) {
            return transaction_lister_constants_1.EXECUTION_STATUS.EXECUTED;
        }
        const confirmationsCount = tx.confirmations?.length || 0;
        const requiredConfirmations = tx.confirmationsRequired || 0;
        return confirmationsCount >= requiredConfirmations ? transaction_lister_constants_1.EXECUTION_STATUS.READY : transaction_lister_constants_1.EXECUTION_STATUS.PENDING;
    }
    /**
     * Display transactions summary
     */
    static displayTransactionsSummary(results, transactionsToShow, transactions, transactionType, limit) {
        console.log(`Found ${results.length} ${transactionType} transaction(s) (showing ${transactionsToShow.length}):`);
        console.log('');
        transactionsToShow.forEach((tx, index) => this.displayTransaction(tx, index));
        if (results.length > limit) {
            console.log(`... and ${results.length - limit} more transaction(s).`);
            console.log(`Use --limit ${results.length} to see all transactions.`);
        }
        console.log(`Total count: ${transactions.count || results.length}`);
        if (transactionType === transaction_lister_constants_1.TRANSACTION_TYPES.PENDING && transactionsToShow.length > 0) {
            console.log('');
            console.log('To confirm pending transactions, use the Safe web interface');
            console.log(`   Visit: ${transaction_lister_constants_1.DISPLAY_VALUES.SAFE_WEB_URL}`);
        }
    }
    /**
     * Display fetching status
     */
    static displayFetchingStatus(transactionType) {
        console.log(`Fetching ${transactionType} transactions...`);
        console.log('');
    }
    /**
     * Display no transactions found message
     */
    static displayNoTransactionsFound(transactionType) {
        console.log(`No ${transactionType} transactions found.`);
    }
    /**
     * Display help text
     */
    static displayHelp() {
        console.log(transaction_lister_constants_1.CLI_HELP_TEXT);
    }
    /**
     * Display error message
     */
    static displayError(message, error) {
        console.error(`Error: ${message}`, error);
    }
}
exports.ListPendingConsoleUtils = ListPendingConsoleUtils;
//# sourceMappingURL=transaction-lister.console.utils.js.map