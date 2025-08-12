"use strict";
/**
 * Console utilities for TransactionExecutor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionConsoleUtils = void 0;
class TransactionConsoleUtils {
    /**
     * Display execution configuration
     */
    static displayExecutionStart(config) {
        console.log('=== Starting Foundry Script Execution ===');
        console.log('Configuration:', {
            forgeScript: config.forgeScript,
            smartContract: config.smartContract,
            rpcUrl: config.rpcUrl?.substring(0, 50) + '...',
            forgeOptions: config.forgeOptions,
            envVars: config.envVars ? 'Present' : 'None',
        });
    }
    /**
     * Display successful completion
     */
    static displayExecutionSuccess() {
        console.log('=== Foundry Script Completed Successfully ===');
    }
    /**
     * Display fallback attempt
     */
    static displayFallbackAttempt(error) {
        console.log('=== Foundry Script Failed, Attempting Fallback ===');
        console.error('Error details:', error);
    }
    /**
     * Display forge command details
     */
    static displayForgeCommand(command, args, scriptPath, contractName, forgeScript, forgeOptions) {
        console.log(`Running command: ${command} ${args.join(' ')}`);
        console.log('Script path:', scriptPath);
        console.log('Contract name:', contractName);
        console.log('Forge script:', forgeScript);
        console.log('Forge options:', forgeOptions);
    }
    /**
     * Display transaction details
     */
    static displayTransactionDetails(transactions) {
        this.displayTransactionList(transactions, 'Transaction Details');
    }
    /**
     * Display transactions in dry run mode
     */
    static displayDryRunTransactions(transactions) {
        console.log('\nTransactions to be executed:');
        this.displayTransactionList(transactions, 'Transaction', true);
    }
    /**
     * Helper method to display a list of transactions
     */
    static displayTransactionList(transactions, prefix, includeData = false) {
        transactions.forEach((tx, index) => {
            console.log(`\n${prefix} ${index + 1}/${transactions.length}:`);
            console.log(`   To: ${tx.to}`);
            console.log(`   Value: ${tx.value}`);
            if (includeData) {
                console.log(`   Data: ${tx.data}`);
            }
            console.log(`   Operation: ${tx.operation || 'call'}`);
        });
    }
    /**
     * Display successful transaction hashes
     */
    static displayTransactionHashes(hashes, method) {
        const methodText = method ? ` (${method})` : '';
        console.log(`\nAll transactions executed successfully${methodText}!`);
        console.log('\nSafe Transaction Hashes:');
        hashes.forEach((hash, index) => {
            console.log(`   ${index + 1}. ${hash}`);
        });
    }
    /**
     * Display broadcast file information
     */
    static displayBroadcastInfo(scriptName, totalTransactions, callTransactions) {
        console.log('Broadcast file loaded successfully');
        console.log('Total transactions in file:', totalTransactions);
        console.log('CALL transactions found:', callTransactions);
    }
    /**
     * Display Anvil status
     */
    static displayAnvilStatus(available) {
        if (available) {
            console.log('Checking Anvil availability...');
        }
        else {
            console.warn('Warning: Anvil is not available. Please install Foundry to use fork functionality.');
            console.log('Continuing without fork.');
        }
    }
    /**
     * Display transaction execution progress
     */
    static displayTransactionProgress(current, total, individual = false) {
        const type = individual ? ' (individual)' : '';
        console.log(`\nProposing transaction ${current}/${total}${type}:`);
    }
    /**
     * Display transaction success
     */
    static displayTransactionSuccess(hash) {
        console.log(`   Success! Hash: ${hash}`);
    }
    /**
     * Display transaction failure
     */
    static displayTransactionFailure(index, error) {
        console.error(`   Failed to propose transaction ${index}:`, error);
    }
}
exports.TransactionConsoleUtils = TransactionConsoleUtils;
//# sourceMappingURL=transaction-executor.console.utils.js.map