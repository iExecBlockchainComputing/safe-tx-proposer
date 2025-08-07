/**
 * Console utilities for TransactionExecutor
 */

import type { ExecutionConfig, TransactionInput } from '../types/transaction-executor.types';

export class TransactionConsoleUtils {
    /**
     * Display execution configuration
     */
    static displayExecutionStart(config: ExecutionConfig): void {
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
    static displayExecutionSuccess(): void {
        console.log('=== Foundry Script Completed Successfully ===');
    }

    /**
     * Display fallback attempt
     */
    static displayFallbackAttempt(error: unknown): void {
        console.log('=== Foundry Script Failed, Attempting Fallback ===');
        console.error('Error details:', error);
    }

    /**
     * Display forge command details
     */
    static displayForgeCommand(
        command: string,
        args: string[],
        scriptPath: string,
        contractName: string,
        forgeScript: string,
        forgeOptions?: string,
    ): void {
        console.log(`Running command: ${command} ${args.join(' ')}`);
        console.log('Script path:', scriptPath);
        console.log('Contract name:', contractName);
        console.log('Forge script:', forgeScript);
        console.log('Forge options:', forgeOptions);
    }

    /**
     * Display transaction details
     */
    static displayTransactionDetails(transactions: TransactionInput[]): void {
        transactions.forEach((tx, index) => {
            console.log(`\nTransaction ${index + 1}/${transactions.length}:`);
            console.log(`   To: ${tx.to}`);
            console.log(`   Value: ${tx.value}`);
            console.log(`   Operation: ${tx.operation || 'call'}`);
        });
    }

    /**
     * Display transactions in dry run mode
     */
    static displayDryRunTransactions(transactions: TransactionInput[]): void {
        console.log('\nTransactions to be executed:');
        transactions.forEach((tx, index) => {
            console.log(`\nTransaction ${index + 1}:`);
            console.log(`   To: ${tx.to}`);
            console.log(`   Value: ${tx.value}`);
            console.log(`   Data: ${tx.data}`);
            console.log(`   Operation: ${tx.operation || 'call'}`);
        });
    }

    /**
     * Display successful transaction hashes
     */
    static displayTransactionHashes(hashes: string[], method?: string): void {
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
    static displayBroadcastInfo(
        scriptName: string,
        totalTransactions: number,
        callTransactions: number,
    ): void {
        console.log('Broadcast file loaded successfully');
        console.log('Total transactions in file:', totalTransactions);
        console.log('CALL transactions found:', callTransactions);
    }

    /**
     * Display Anvil status
     */
    static displayAnvilStatus(available: boolean): void {
        if (available) {
            console.log('Checking Anvil availability...');
        } else {
            console.warn(
                'Warning: Anvil is not available. Please install Foundry to use fork functionality.',
            );
            console.log('Continuing without fork.');
        }
    }

    /**
     * Display transaction execution progress
     */
    static displayTransactionProgress(
        current: number,
        total: number,
        individual: boolean = false,
    ): void {
        const type = individual ? '(individual)' : '';
        console.log(`\nProposing transaction ${current}/${total} ${type}:`);
    }

    /**
     * Display transaction success
     */
    static displayTransactionSuccess(hash: string): void {
        console.log(`   Success! Hash: ${hash}`);
    }

    /**
     * Display transaction failure
     */
    static displayTransactionFailure(index: number, error: unknown): void {
        console.error(`   Failed to propose transaction ${index}:`, error);
    }
}
