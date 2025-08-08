/**
 * Types and interfaces for TransactionExecutor
 */
export interface BroadcastTransaction {
    hash: string;
    transactionType: string;
    contractName: string | null;
    contractAddress: string;
    function: string;
    arguments: unknown[];
    transaction: {
        from: string;
        to: string;
        gas: string;
        value: string;
        input: string;
        nonce: string;
        chainId: string;
    };
    additionalContracts: unknown[];
    isFixedGasLimit: boolean;
}
export interface BroadcastFile {
    transactions: BroadcastTransaction[];
    receipts: unknown[];
    libraries: unknown[];
    pending: unknown[];
    returns: unknown;
    timestamp: number;
    chain: number;
    multi: boolean;
    commit: string;
}
export interface TransactionInput {
    to: string;
    value: string;
    data: string;
    operation?: 'call' | 'delegatecall';
    from?: string;
}
export interface ExecutionConfig {
    dryRun?: boolean;
    scriptName?: string;
    rpcUrl: string;
    forgeOptions?: string;
    forgeScript?: string;
    smartContract?: string;
    envVars?: string;
}
export interface ForgeCommandResult {
    command: string;
    args: string[];
    contractName: string;
    scriptPath: string;
    forgeScript: string;
}
//# sourceMappingURL=transaction-executor.types.d.ts.map