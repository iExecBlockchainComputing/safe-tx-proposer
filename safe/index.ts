/**
 * Safe Multisig Transaction Proposer for EVM Networks
 */

export type { MetaTransactionData, OperationType } from '@safe-global/types-kit';
export { getProposerConfig, getSafeConfig, validateEnvironment } from './config';
export type { OwnerConfig, SafeConfig } from './config';
export { SafeManager } from './safe-manager';
export * from './utils';
