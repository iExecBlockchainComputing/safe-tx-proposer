/**
 * Console utilities for TransactionExecutor
 */
import type { ExecutionConfig, TransactionInput } from '../types/transaction-executor.types';
export declare class TransactionConsoleUtils {
    /**
     * Display execution configuration
     */
    static displayExecutionStart(config: ExecutionConfig): void;
    /**
     * Display successful completion
     */
    static displayExecutionSuccess(): void;
    /**
     * Display fallback attempt
     */
    static displayFallbackAttempt(error: unknown): void;
    /**
     * Display forge command details
     */
    static displayForgeCommand(command: string, args: string[], scriptPath: string, contractName: string, forgeScript: string, forgeOptions?: string): void;
    /**
     * Display transaction details
     */
    static displayTransactionDetails(transactions: TransactionInput[]): void;
    /**
     * Display transactions in dry run mode
     */
    static displayDryRunTransactions(transactions: TransactionInput[]): void;
    /**
     * Display successful transaction hashes
     */
    static displayTransactionHashes(hashes: string[], method?: string): void;
    /**
     * Display broadcast file information
     */
    static displayBroadcastInfo(scriptName: string, totalTransactions: number, callTransactions: number): void;
    /**
     * Display Anvil status
     */
    static displayAnvilStatus(available: boolean): void;
    /**
     * Display transaction execution progress
     */
    static displayTransactionProgress(current: number, total: number, individual?: boolean): void;
    /**
     * Display transaction success
     */
    static displayTransactionSuccess(hash: string): void;
    /**
     * Display transaction failure
     */
    static displayTransactionFailure(index: number, error: unknown): void;
}
//# sourceMappingURL=transaction-executor.console.utils.d.ts.map