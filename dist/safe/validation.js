"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const ethers_1 = require("ethers");
const errors_1 = require("./errors");
class Validator {
    /**
     * Validate Ethereum address
     */
    static validateAddress(address, fieldName = 'address') {
        if (!address) {
            throw new errors_1.ValidationError(`${fieldName} is required`, errors_1.ErrorCode.INVALID_ADDRESS, {
                field: fieldName,
                value: address,
            });
        }
        if (!ethers_1.ethers.isAddress(address)) {
            throw new errors_1.ValidationError(`Invalid ${fieldName}: ${String(address)}`, errors_1.ErrorCode.INVALID_ADDRESS, { field: fieldName, value: address });
        }
    }
    /**
     * Validate private key format
     */
    static validatePrivateKey(privateKey, fieldName = 'private key') {
        if (!privateKey) {
            throw new errors_1.ValidationError(`${fieldName} is required`, errors_1.ErrorCode.INVALID_PRIVATE_KEY, {
                field: fieldName,
            });
        }
        // Remove 0x prefix if present
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        // Check length (64 characters for 32 bytes)
        if (cleanKey.length !== 64) {
            throw new errors_1.ValidationError(`Invalid ${fieldName} length. Expected 64 characters (32 bytes)`, errors_1.ErrorCode.INVALID_PRIVATE_KEY, { field: fieldName, length: cleanKey.length });
        }
        // Check if it's valid hex
        if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
            throw new errors_1.ValidationError(`Invalid ${fieldName} format. Must be a valid hexadecimal string`, errors_1.ErrorCode.INVALID_PRIVATE_KEY, { field: fieldName });
        }
    }
    /**
     * Validate RPC URL
     */
    static validateRpcUrl(rpcUrl, fieldName = 'RPC URL') {
        if (!rpcUrl) {
            throw new errors_1.ValidationError(`${fieldName} is required`, errors_1.ErrorCode.INVALID_RPC_URL, {
                field: fieldName,
            });
        }
        try {
            const url = new URL(rpcUrl);
            if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) {
                throw new errors_1.ValidationError(`Invalid ${fieldName} protocol. Must be http, https, ws, or wss`, errors_1.ErrorCode.INVALID_RPC_URL, { field: fieldName, value: rpcUrl, protocol: url.protocol });
            }
        }
        catch (error) {
            throw new errors_1.ValidationError(`Invalid ${fieldName} format: ${rpcUrl}`, errors_1.ErrorCode.INVALID_RPC_URL, { field: fieldName, value: rpcUrl, originalError: error });
        }
    }
    /**
     * Validate chain ID
     */
    static validateChainId(chainId, fieldName = 'chain ID') {
        if (!chainId && chainId !== 0) {
            throw new errors_1.ValidationError(`${fieldName} is required`, errors_1.ErrorCode.INVALID_CONFIGURATION, {
                field: fieldName,
            });
        }
        const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
        if (isNaN(numericChainId) || numericChainId < 0) {
            throw new errors_1.ValidationError(`Invalid ${fieldName}: must be a non-negative number`, errors_1.ErrorCode.INVALID_CONFIGURATION, { field: fieldName, value: chainId });
        }
        // Validate against known chain IDs
        const knownChainIds = [1, 11155111, 42161, 421614, 31337, 1337];
        if (!knownChainIds.includes(numericChainId)) {
            // This is a warning, not an error
            process.stderr.write(`Warning: Chain ID ${numericChainId} is not in the list of known networks. ` +
                `Known chains: ${knownChainIds.join(', ')}\n`);
        }
    }
    /**
     * Validate hex string
     */
    static validateHexString(hex, fieldName = 'hex value', expectedLength) {
        if (!hex) {
            throw new errors_1.ValidationError(`${fieldName} is required`, errors_1.ErrorCode.INVALID_HEX_VALUE, {
                field: fieldName,
            });
        }
        const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
        if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
            throw new errors_1.ValidationError(`Invalid ${fieldName}: must be a valid hexadecimal string`, errors_1.ErrorCode.INVALID_HEX_VALUE, { field: fieldName, value: hex });
        }
        if (expectedLength && cleanHex.length !== expectedLength) {
            throw new errors_1.ValidationError(`Invalid ${fieldName} length: expected ${expectedLength} characters, got ${cleanHex.length}`, errors_1.ErrorCode.INVALID_HEX_VALUE, { field: fieldName, value: hex, expectedLength, actualLength: cleanHex.length });
        }
    }
    /**
     * Validate transaction data
     */
    static validateTransactionData(txData) {
        this.validateAddress(txData.to, 'transaction recipient');
        this.validateTransactionValue(txData.value);
        this.validateTransactionData_Data(txData.data);
        this.validateTransactionOperation(txData.operation);
    }
    /**
     * Validate transaction value
     */
    static validateTransactionValue(value) {
        if (value && value !== '0') {
            if (!/^\d+$/.test(value) && !value.startsWith('0x')) {
                throw new errors_1.ValidationError('Invalid transaction value format', errors_1.ErrorCode.INVALID_TRANSACTION_DATA, { field: 'value', value });
            }
        }
    }
    /**
     * Validate transaction data field
     */
    static validateTransactionData_Data(data) {
        if (data && data !== '0x') {
            this.validateHexString(data, 'transaction data');
        }
    }
    /**
     * Validate transaction operation
     */
    static validateTransactionOperation(operation) {
        if (operation === undefined) {
            return;
        }
        if (typeof operation === 'string') {
            this.validateStringOperation(operation);
        }
        else if (typeof operation === 'number') {
            this.validateNumericOperation(operation);
        }
        else {
            throw new errors_1.ValidationError('Invalid operation type: must be string or number', errors_1.ErrorCode.INVALID_TRANSACTION_DATA, { field: 'operation', value: operation, type: typeof operation });
        }
    }
    /**
     * Validate string operation type
     */
    static validateStringOperation(operation) {
        if (!['call', 'delegatecall'].includes(operation)) {
            throw new errors_1.ValidationError('Invalid operation type: must be "call" or "delegatecall"', errors_1.ErrorCode.INVALID_TRANSACTION_DATA, { field: 'operation', value: operation });
        }
    }
    /**
     * Validate numeric operation type
     */
    static validateNumericOperation(operation) {
        if (![0, 1].includes(operation)) {
            throw new errors_1.ValidationError('Invalid operation type: must be 0 (Call) or 1 (DelegateCall)', errors_1.ErrorCode.INVALID_TRANSACTION_DATA, { field: 'operation', value: operation });
        }
    }
    /**
     * Validate environment variables
     */
    static validateEnvironmentVariables(envVars) {
        const errors = [];
        const warnings = [];
        this.validateRequiredEnvVars(envVars, errors);
        this.validateEnvVarFormats(envVars, errors);
        this.checkProductionSecurity(envVars, warnings);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate required environment variables
     */
    static validateRequiredEnvVars(envVars, errors) {
        const required = ['RPC_URL', 'SAFE_ADDRESS', 'SAFE_API_KEY', 'PROPOSER_PRIVATE_KEY'];
        for (const envVar of required) {
            if (!envVars[envVar]) {
                errors.push(`Missing required environment variable: ${envVar}`);
            }
        }
    }
    /**
     * Validate environment variable formats
     */
    static validateEnvVarFormats(envVars, errors) {
        this.validateEnvVarFormat(envVars, 'RPC_URL', (value) => this.validateRpcUrl(value), errors);
        this.validateEnvVarFormat(envVars, 'SAFE_ADDRESS', (value) => this.validateAddress(value, 'SAFE_ADDRESS'), errors);
        this.validateEnvVarFormat(envVars, 'PROPOSER_PRIVATE_KEY', (value) => this.validatePrivateKey(value, 'PROPOSER_PRIVATE_KEY'), errors);
        this.validateEnvVarFormat(envVars, 'CHAIN_ID', (value) => this.validateChainId(value), errors);
    }
    /**
     * Validate a specific environment variable format
     */
    static validateEnvVarFormat(envVars, varName, validator, errors) {
        if (envVars[varName]) {
            try {
                validator(envVars[varName]);
            }
            catch (error) {
                errors.push(`Invalid ${varName}: ${error.message}`);
            }
        }
    }
    /**
     * Check for production security issues
     */
    static checkProductionSecurity(envVars, warnings) {
        if (process.env.NODE_ENV === 'production') {
            if (envVars.PROPOSER_PRIVATE_KEY &&
                envVars.PROPOSER_PRIVATE_KEY.length > 10) {
                warnings.push('Private key detected in environment - ensure logs are secure');
            }
        }
    }
}
exports.Validator = Validator;
//# sourceMappingURL=validation.js.map