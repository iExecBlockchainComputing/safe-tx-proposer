/**
 * Types and interfaces for TransactionLister
 */

export interface ListPendingArgs {
    type?: 'pending' | 'all' | 'incoming' | 'multisig' | 'module';
    limit?: string;
}

export interface TransactionResult {
    safeTxHash?: string;
    to?: string;
    value?: string;
    data?: string | null;
    confirmations?: Array<{ owner?: string }>;
    confirmationsRequired?: number;
    isExecuted?: boolean;
    submissionDate?: string;
}

export interface TransactionResponse {
    results?: unknown[];
    count?: number;
}

export interface ListPendingConfig {
    type: 'pending' | 'all' | 'incoming' | 'multisig' | 'module';
    limit: number;
}

export type TransactionType = 'pending' | 'all' | 'incoming' | 'multisig' | 'module';
