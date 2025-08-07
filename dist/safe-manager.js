"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeManager = void 0;
const api_kit_1 = __importDefault(require("@safe-global/api-kit"));
const protocol_kit_1 = __importDefault(require("@safe-global/protocol-kit"));
const types_kit_1 = require("@safe-global/types-kit");
const config_1 = require("./config");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const validation_1 = require("./validation");
class SafeManager {
    constructor(safeConfig) {
        this.safeConfig = safeConfig;
        this.apiKit = new api_kit_1.default({
            chainId: this.safeConfig.chainId,
            apiKey: this.safeConfig.apiKey,
        });
        logger_1.logger.info('SafeManager initialized successfully', {
            chainId: this.safeConfig.chainId,
            safeAddress: this.safeConfig.safeAddress,
        });
    }
    static async create() {
        try {
            const safeConfig = await (0, config_1.getSafeConfig)();
            return new SafeManager(safeConfig);
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize SafeManager', { error });
            throw new errors_1.ConfigurationError('SafeManager initialization failed', {
                originalError: error,
            });
        }
    }
    /**
     * Create a Protocol Kit instance for a specific owner
     */
    async createProtocolKit(ownerConfig) {
        try {
            logger_1.logger.debug('Creating Protocol Kit instance', {
                safeAddress: this.safeConfig.safeAddress,
                ownerAddress: ownerConfig.address,
            });
            // Validate owner configuration
            validation_1.Validator.validateAddress(ownerConfig.address, 'Owner address');
            validation_1.Validator.validatePrivateKey(ownerConfig.privateKey);
            const protocolKit = await protocol_kit_1.default.init({
                provider: this.safeConfig.rpcUrl,
                signer: ownerConfig.privateKey,
                safeAddress: this.safeConfig.safeAddress,
            });
            logger_1.logger.debug('Protocol Kit instance created successfully');
            return protocolKit;
        }
        catch (error) {
            logger_1.logger.error('Failed to create Protocol Kit instance', {
                error,
                safeAddress: this.safeConfig.safeAddress,
                ownerAddress: ownerConfig.address,
            });
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.SafeTransactionError('Failed to initialize Safe Protocol Kit', errors_1.ErrorCode.SAFE_TRANSACTION_FAILED, { originalError: error, ownerAddress: ownerConfig.address });
        }
    }
    /*//////////////////////////////////////////////////////////////
                      CREATE TRANSACTION - PROPOSE
    //////////////////////////////////////////////////////////////*/
    /**
     * Propose a transaction to the Safe
     */
    async proposeTransaction(transactionData) {
        const ownerConfig = (0, config_1.getProposerConfig)();
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
    createContractCallTransaction(to, data, value = '0') {
        return {
            to,
            value,
            data,
            operation: types_kit_1.OperationType.Call,
        };
    }
    /**
     * Helper method to create a delegate call transaction
     */
    createDelegateCallTransaction(to, data) {
        return {
            to,
            value: '0',
            data,
            operation: types_kit_1.OperationType.DelegateCall,
        };
    }
    /**
     * Get a specific transaction by hash
     */
    async getTransaction(safeTxHash) {
        return await this.apiKit.getTransaction(safeTxHash);
    }
    /*//////////////////////////////////////////////////////////////
                            LIST-TRANSACTION
    //////////////////////////////////////////////////////////////*/
    /**
     * Get pending transactions
     */
    async getPendingTransactions() {
        return await this.apiKit.getPendingTransactions(this.safeConfig.safeAddress);
    }
    /**
     * Get all transactions
     */
    async getAllTransactions() {
        return await this.apiKit.getAllTransactions(this.safeConfig.safeAddress);
    }
    /**
     * Get incoming transactions
     */
    async getIncomingTransactions() {
        return await this.apiKit.getIncomingTransactions(this.safeConfig.safeAddress);
    }
    /**
     * Get multisig transactions
     */
    async getMultisigTransactions() {
        return await this.apiKit.getMultisigTransactions(this.safeConfig.safeAddress);
    }
    /**
     * Get module transactions
     */
    async getModuleTransactions() {
        return await this.apiKit.getModuleTransactions(this.safeConfig.safeAddress);
    }
    /**
     * Get the current nonce for the Safe
     */
    async getCurrentNonce() {
        const ownerConfig = (0, config_1.getProposerConfig)();
        const protocolKit = await this.createProtocolKit(ownerConfig);
        return await protocolKit.getNonce();
    }
    /**
     * Get Safe information including owners
     */
    async getSafeInfo() {
        return await this.apiKit.getSafeInfo(this.safeConfig.safeAddress);
    }
    /**
     * Get all owners of the Safe
     */
    async getSafeOwners() {
        const safeInfo = await this.getSafeInfo();
        return safeInfo.owners;
    }
    /**
     * Get the Safe address
     */
    getSafeAddress() {
        return this.safeConfig.safeAddress;
    }
    /**
     * Propose a transaction to the Safe with explicit nonce
     */
    async proposeTransactionWithNonce(transactionData, nonce) {
        const ownerConfig = (0, config_1.getProposerConfig)();
        const protocolKit = await this.createProtocolKit(ownerConfig);
        logger_1.logger.debug('Transaction data for proposal', { transactionData });
        // Create transaction with explicit nonce
        const safeTransaction = await protocolKit.createTransaction({
            transactions: [transactionData],
            options: {
                nonce,
            },
        });
        const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
        const signature = await protocolKit.signHash(safeTxHash);
        logger_1.logger.debug('Safe transaction data created', {
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
        }
        catch (error) {
            this.handleProposeTransactionError(error, nonce, transactionData);
            throw error;
        }
        return safeTxHash;
    }
    /**
     * Handle errors from propose transaction operations
     */
    handleProposeTransactionError(error, nonce, transactionData) {
        logger_1.logger.error('Error proposing transaction with nonce', {
            nonce,
            error,
            transactionData,
        });
        // Add more detailed error information
        if (error && typeof error === 'object') {
            if ('response' in error && error.response && typeof error.response === 'object') {
                if ('status' in error.response) {
                    logger_1.logger.error('API Response Status', { status: error.response.status });
                }
                if ('data' in error.response) {
                    logger_1.logger.error('API Response Data', { data: error.response.data });
                }
            }
            if ('code' in error) {
                logger_1.logger.error('Error Code', { code: error.code });
            }
            if ('details' in error) {
                logger_1.logger.error('Error Details', { details: error.details });
            }
        }
    }
    /**
     * Propose multiple transactions with sequential nonces
     */
    async proposeTransactionsWithSequentialNonces(transactionsData) {
        if (transactionsData.length === 0) {
            return [];
        }
        const baseNonce = await this.getCurrentNonce();
        logger_1.logger.info('Current base nonce', { baseNonce });
        const hashes = [];
        for (let i = 0; i < transactionsData.length; i++) {
            const nonce = baseNonce + i;
            logger_1.logger.info('Proposing transaction', {
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
            }
            catch (error) {
                logger_1.logger.error('Failed to propose transaction', {
                    transactionIndex: i + 1,
                    nonce,
                });
                // If nonce conflict, try to get fresh nonce and retry
                if (error instanceof Error && error.message.includes('Unprocessable Content')) {
                    logger_1.logger.info('Retrying with fresh nonce');
                    const freshNonce = await this.getCurrentNonce();
                    logger_1.logger.info('Fresh nonce retrieved', { freshNonce });
                    if (freshNonce !== nonce) {
                        const retryNonce = freshNonce + i;
                        logger_1.logger.info('Retrying transaction with updated nonce', {
                            transactionIndex: i + 1,
                            retryNonce,
                        });
                        const hash = await this.proposeTransactionWithNonce(transactionsData[i], retryNonce);
                        hashes.push(hash);
                    }
                    else {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        return hashes;
    }
}
exports.SafeManager = SafeManager;
//# sourceMappingURL=safe-manager.js.map