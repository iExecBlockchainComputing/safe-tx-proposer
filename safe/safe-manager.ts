import SafeApiKit, { SafeInfoResponse } from '@safe-global/api-kit';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData, OperationType } from '@safe-global/types-kit';
import { getProposerConfig, getSafeConfig, OwnerConfig, SafeConfig } from './config';
import { AppError, ConfigurationError, ErrorCode, SafeTransactionError } from './errors';
import { logger } from './logger';
import { Validator } from './validation';

// Type for API errors with response structure
type ApiError = {
    response?: {
        status?: number;
        data?: unknown;
    };
    code?: string | number;
    details?: unknown;
    message?: string;
};

// Type for error details extraction
type ErrorDetails = {
    status?: number;
    responseData?: unknown;
    code?: string | number;
    errorDetails?: unknown;
};

export class SafeManager {
    private apiKit: SafeApiKit;
    private safeConfig: SafeConfig;

    private constructor(safeConfig: SafeConfig) {
        this.safeConfig = safeConfig;
        this.apiKit = new SafeApiKit({
            chainId: this.safeConfig.chainId,
            apiKey: this.safeConfig.apiKey,
        });

        logger.info('SafeManager initialized successfully', {
            chainId: this.safeConfig.chainId,
            safeAddress: this.safeConfig.safeAddress,
        });
    }

    static async create(): Promise<SafeManager> {
        try {
            const safeConfig = await getSafeConfig();
            return new SafeManager(safeConfig);
        } catch (error) {
            logger.error('Failed to initialize SafeManager', { error });
            throw new ConfigurationError('SafeManager initialization failed', {
                originalError: error,
            });
        }
    }

    /**
     * Create a Protocol Kit instance for a specific owner
     */
    private async createProtocolKit(ownerConfig: OwnerConfig): Promise<Safe> {
        try {
            // Validate owner configuration
            Validator.validateAddress(ownerConfig.address, 'Owner address');
            Validator.validatePrivateKey(ownerConfig.privateKey);

            const protocolKit = await Safe.init({
                provider: this.safeConfig.rpcUrl,
                signer: ownerConfig.privateKey,
                safeAddress: this.safeConfig.safeAddress,
            });

            return protocolKit;
        } catch (error) {
            logger.error('Failed to create Protocol Kit instance', {
                error,
                safeAddress: this.safeConfig.safeAddress,
                ownerAddress: ownerConfig.address,
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new SafeTransactionError(
                'Failed to initialize Safe Protocol Kit',
                ErrorCode.SAFE_TRANSACTION_FAILED,
                { originalError: error, ownerAddress: ownerConfig.address },
            );
        }
    }

    /*//////////////////////////////////////////////////////////////
                      CREATE TRANSACTION - PROPOSE
    //////////////////////////////////////////////////////////////*/

    /**
     * Propose a transaction to the Safe
     */
    async proposeTransaction(transactionData: MetaTransactionData): Promise<string> {
        const ownerConfig = getProposerConfig();
        const protocolKit = await this.createProtocolKit(ownerConfig);

        // Create transaction
        const safeTransaction = await protocolKit.createTransaction({
            transactions: [transactionData],
        });

        const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
        const signature = await protocolKit.signHash(safeTxHash);

        // Propose transaction to the service
        await this.apiKit.proposeTransaction({
            safeAddress: this.safeConfig.safeAddress,
            safeTransactionData: safeTransaction.data,
            safeTxHash,
            senderAddress: ownerConfig.address,
            senderSignature: signature.data,
        });

        return safeTxHash;
    }

    /**
     * Helper method to create a contract call transaction
     */
    createContractCallTransaction(
        to: string,
        data: string,
        value: string = '0',
    ): MetaTransactionData {
        return {
            to,
            value,
            data,
            operation: OperationType.Call,
        };
    }

    /**
     * Helper method to create a delegate call transaction
     */
    createDelegateCallTransaction(to: string, data: string): MetaTransactionData {
        return {
            to,
            value: '0',
            data,
            operation: OperationType.DelegateCall,
        };
    }

    /**
     * Get the current nonce for the Safe
     */
    async getCurrentNonce(): Promise<number> {
        const ownerConfig = getProposerConfig();
        const protocolKit = await this.createProtocolKit(ownerConfig);
        return await protocolKit.getNonce();
    }

    /**
     * Get Safe information including owners (internal helper)
     */
    private async getSafeInfo(): Promise<SafeInfoResponse> {
        return await this.apiKit.getSafeInfo(this.safeConfig.safeAddress);
    }

    /**
     * Get all owners of the Safe
     */
    async getSafeOwners(): Promise<string[]> {
        const safeInfo = await this.getSafeInfo();
        return safeInfo.owners;
    }

    /**
     * Get the Safe address
     */
    getSafeAddress(): string {
        return this.safeConfig.safeAddress;
    }

    /**
     * Propose a transaction to the Safe with explicit nonce
     */
    async proposeTransactionWithNonce(
        transactionData: MetaTransactionData,
        nonce: number,
    ): Promise<string> {
        const ownerConfig = getProposerConfig();
        const protocolKit = await this.createProtocolKit(ownerConfig);

        logger.debug('Transaction data for proposal', { transactionData });

        // Create transaction with explicit nonce
        const safeTransaction = await protocolKit.createTransaction({
            transactions: [transactionData],
            options: {
                nonce,
            },
        });

        const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
        const signature = await protocolKit.signHash(safeTxHash);

        logger.debug('Safe transaction data created', {
            safeTransactionData: safeTransaction.data,
        });

        // Propose transaction to the service
        try {
            await this.apiKit.proposeTransaction({
                safeAddress: this.safeConfig.safeAddress,
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderAddress: ownerConfig.address,
                senderSignature: signature.data,
            });
        } catch (error) {
            this.handleProposeTransactionError(error, nonce, transactionData);
            throw error;
        }

        return safeTxHash;
    }

    /**
     * Handle errors from propose transaction operations
     */
    private handleProposeTransactionError(
        error: unknown,
        nonce: number,
        transactionData: MetaTransactionData,
    ): void {
        logger.error('Error proposing transaction with nonce', {
            nonce,
            error,
            transactionData,
            errorDetails: this.extractErrorDetails(error),
        });
    }

    /**
     * Extract detailed error information for logging
     */
    private extractErrorDetails(error: unknown): ErrorDetails {
        if (!error || typeof error !== 'object') {
            return {};
        }

        const details: ErrorDetails = {};
        const err = error as ApiError;

        if (err.response && typeof err.response === 'object') {
            if (typeof err.response.status === 'number') {
                details.status = err.response.status;
            }
            if (err.response.data !== undefined) {
                details.responseData = err.response.data;
            }
        }

        if (err.code !== undefined) {
            details.code = err.code;
        }

        if (err.details !== undefined) {
            details.errorDetails = err.details;
        }

        return details;
    }

    /**
     * Propose multiple transactions with sequential nonces
     */
    async proposeTransactionsWithSequentialNonces(
        transactionsData: MetaTransactionData[],
    ): Promise<string[]> {
        if (transactionsData.length === 0) {
            return [];
        }

        const baseNonce = await this.getCurrentNonce();
        logger.info('Current base nonce', { baseNonce });
        const hashes: string[] = [];

        for (let i = 0; i < transactionsData.length; i++) {
            const nonce = baseNonce + i;
            logger.info('Proposing transaction', {
                transactionIndex: i + 1,
                totalTransactions: transactionsData.length,
                nonce,
            });

            try {
                const hash = await this.proposeTransactionWithNonce(transactionsData[i], nonce);
                hashes.push(hash);

                // Small delay to avoid potential rate limiting
                if (i < transactionsData.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            } catch (error) {
                logger.error('Failed to propose transaction', {
                    transactionIndex: i + 1,
                    nonce,
                });

                // If nonce conflict, try to get fresh nonce and retry
                if (error instanceof Error && error.message.includes('Unprocessable Content')) {
                    logger.info('Retrying with fresh nonce');
                    const freshNonce = await this.getCurrentNonce();
                    logger.info('Fresh nonce retrieved', { freshNonce });

                    if (freshNonce !== nonce) {
                        const retryNonce = freshNonce + i;
                        logger.info('Retrying transaction with updated nonce', {
                            transactionIndex: i + 1,
                            retryNonce,
                        });
                        const hash = await this.proposeTransactionWithNonce(
                            transactionsData[i],
                            retryNonce,
                        );
                        hashes.push(hash);
                    } else {
                        throw error;
                    }
                } else {
                    throw error;
                }
            }
        }

        return hashes;
    }
}
