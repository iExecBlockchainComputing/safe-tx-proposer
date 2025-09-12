import { ethers } from 'ethers';
import { ErrorCode, ValidationError } from './errors';

/**
 * Comprehensive validation utilities for production use
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export class Validator {
    /**
     * Validate Ethereum address
     */
    static validateAddress(address: string, fieldName = 'address'): void {
        if (!address) {
            throw new ValidationError(`${fieldName} is required`, ErrorCode.INVALID_ADDRESS, {
                field: fieldName,
                value: address,
            });
        }

        if (!ethers.isAddress(address)) {
            throw new ValidationError(
                `Invalid ${fieldName}: ${String(address)}`,
                ErrorCode.INVALID_ADDRESS,
                { field: fieldName, value: address },
            );
        }
    }

    /**
     * Validate private key format
     */
    static validatePrivateKey(privateKey: string, fieldName: string = 'private key'): void {
        if (!privateKey) {
            throw new ValidationError(`${fieldName} is required`, ErrorCode.INVALID_PRIVATE_KEY, {
                field: fieldName,
            });
        }

        // Remove 0x prefix if present
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

        // Check length (64 characters for 32 bytes)
        if (cleanKey.length !== 64) {
            throw new ValidationError(
                `Invalid ${fieldName} length. Expected 64 characters (32 bytes)`,
                ErrorCode.INVALID_PRIVATE_KEY,
                { field: fieldName, length: cleanKey.length },
            );
        }

        // Check if it's valid hex
        if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
            throw new ValidationError(
                `Invalid ${fieldName} format. Must be a valid hexadecimal string`,
                ErrorCode.INVALID_PRIVATE_KEY,
                { field: fieldName },
            );
        }
    }

    /**
     * Validate RPC URL
     */
    static validateRpcUrl(rpcUrl: string, fieldName: string = 'RPC URL'): void {
        if (!rpcUrl) {
            throw new ValidationError(`${fieldName} is required`, ErrorCode.INVALID_RPC_URL, {
                field: fieldName,
            });
        }

        try {
            const url = new URL(rpcUrl);
            if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) {
                throw new ValidationError(
                    `Invalid ${fieldName} protocol. Must be http, https, ws, or wss`,
                    ErrorCode.INVALID_RPC_URL,
                    { field: fieldName, value: rpcUrl, protocol: url.protocol },
                );
            }
        } catch (error) {
            throw new ValidationError(
                `Invalid ${fieldName} format: ${rpcUrl}`,
                ErrorCode.INVALID_RPC_URL,
                { field: fieldName, value: rpcUrl, originalError: error },
            );
        }
    }

    /**
     * Validate chain ID
     */
    static validateChainId(chainId: string | number, fieldName: string = 'chain ID'): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        let isValid = true;
    
        if (!chainId && chainId !== 0) {
            errors.push(`${fieldName} is required`);
            isValid = false;
        }

        const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;

        if (isNaN(numericChainId) || numericChainId < 0) {
            errors.push(`Invalid ${fieldName}: must be a non-negative number`);
            isValid = false;
        }

        // Validate against known chain IDs
        const knownChainIds = [1, 11155111, 42161, 421614, 31337, 1337];
        if (!knownChainIds.includes(numericChainId)) {
            // This is a warning, not an error
            warnings.push(
                `Chain ID ${numericChainId} is not in the list of known networks. ` +
                `Known chains: ${knownChainIds.join(', ')}`
            );
        }
        return { isValid, errors, warnings };
    }

    /**
     * Validate hex string
     */
    static validateHexString(
        hex: string,
        fieldName: string = 'hex value',
        expectedLength?: number,
    ): void {
        if (!hex) {
            throw new ValidationError(`${fieldName} is required`, ErrorCode.INVALID_HEX_VALUE, {
                field: fieldName,
            });
        }

        const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

        if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
            throw new ValidationError(
                `Invalid ${fieldName}: must be a valid hexadecimal string`,
                ErrorCode.INVALID_HEX_VALUE,
                { field: fieldName, value: hex },
            );
        }

        if (expectedLength && cleanHex.length !== expectedLength) {
            throw new ValidationError(
                `Invalid ${fieldName} length: expected ${expectedLength} characters, got ${cleanHex.length}`,
                ErrorCode.INVALID_HEX_VALUE,
                { field: fieldName, value: hex, expectedLength, actualLength: cleanHex.length },
            );
        }
    }

    /**
     * Validate transaction data
     */
    static validateTransactionData(txData: {
        to: string;
        value: string;
        data: string;
        operation?: string | number;
    }): void {
        this.validateAddress(txData.to, 'transaction recipient');
        this.validateTransactionValue(txData.value);
        this.validateTransactionData_Data(txData.data);
        this.validateTransactionOperation(txData.operation);
    }

    /**
     * Validate transaction value
     */
    private static validateTransactionValue(value: string): void {
        if (value && value !== '0') {
            if (!/^\d+$/.test(value) && !value.startsWith('0x')) {
                throw new ValidationError(
                    'Invalid transaction value format',
                    ErrorCode.INVALID_TRANSACTION_DATA,
                    { field: 'value', value },
                );
            }
        }
    }

    /**
     * Validate transaction data field
     */
    private static validateTransactionData_Data(data: string): void {
        if (data && data !== '0x') {
            this.validateHexString(data, 'transaction data');
        }
    }

    /**
     * Validate transaction operation
     */
    private static validateTransactionOperation(operation?: string | number): void {
        if (operation === undefined) {
            return;
        }

        if (typeof operation === 'string') {
            this.validateStringOperation(operation);
        } else if (typeof operation === 'number') {
            this.validateNumericOperation(operation);
        } else {
            throw new ValidationError(
                'Invalid operation type: must be string or number',
                ErrorCode.INVALID_TRANSACTION_DATA,
                { field: 'operation', value: operation, type: typeof operation },
            );
        }
    }

    /**
     * Validate string operation type
     */
    private static validateStringOperation(operation: string): void {
        if (!['call', 'delegatecall'].includes(operation)) {
            throw new ValidationError(
                'Invalid operation type: must be "call" or "delegatecall"',
                ErrorCode.INVALID_TRANSACTION_DATA,
                { field: 'operation', value: operation },
            );
        }
    }

    /**
     * Validate numeric operation type
     */
    private static validateNumericOperation(operation: number): void {
        if (![0, 1].includes(operation)) {
            throw new ValidationError(
                'Invalid operation type: must be 0 (Call) or 1 (DelegateCall)',
                ErrorCode.INVALID_TRANSACTION_DATA,
                { field: 'operation', value: operation },
            );
        }
    }

    /**
     * Validate environment variables
     */
    static validateEnvironmentVariables(envVars: Record<string, unknown>): ValidationResult {
        const requiredVarsResult = this.validateRequiredEnvVars(envVars);
        const formatsResult = this.validateEnvVarFormats(envVars);
        const securityResult = this.checkProductionSecurity(envVars);

        const allErrors = [
            ...requiredVarsResult.errors,
            ...formatsResult.errors,
            ...securityResult.errors,
        ];

        const allWarnings = [
            ...requiredVarsResult.warnings,
            ...formatsResult.warnings,
            ...securityResult.warnings,
        ];

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
        };
    }

    /**
     * Validate required environment variables
     */
    private static validateRequiredEnvVars(
        envVars: Record<string, unknown>,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const required = ['RPC_URL', 'SAFE_ADDRESS', 'SAFE_API_KEY', 'PROPOSER_PRIVATE_KEY'];

        for (const envVar of required) {
            if (!envVars[envVar]) {
                errors.push(`Missing required environment variable: ${envVar}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validate environment variable formats
     */
    private static validateEnvVarFormats(envVars: Record<string, unknown>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        const rpcResult = this.validateEnvVarFormat(
            envVars,
            'RPC_URL',
            (value) => this.validateRpcUrl(value as string),
        );
        errors.push(...rpcResult.errors);
        warnings.push(...rpcResult.warnings);

        const safeAddressResult = this.validateEnvVarFormat(
            envVars,
            'SAFE_ADDRESS',
            (value) => this.validateAddress(value as string, 'SAFE_ADDRESS'),
        );
        errors.push(...safeAddressResult.errors);
        warnings.push(...safeAddressResult.warnings);

        const privateKeyResult = this.validateEnvVarFormat(
            envVars,
            'PROPOSER_PRIVATE_KEY',
            (value) => this.validatePrivateKey(value as string, 'PROPOSER_PRIVATE_KEY'),
        );
        errors.push(...privateKeyResult.errors);
        warnings.push(...privateKeyResult.warnings);

        const chainIdResult = this.validateEnvVarFormat(
            envVars,
            'CHAIN_ID',
            (value) => this.validateChainId(value as string | number),
        );
        errors.push(...chainIdResult.errors);
        warnings.push(...chainIdResult.warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validate a specific environment variable format
     */
    private static validateEnvVarFormat(
        envVars: Record<string, unknown>,
        varName: string,
        validator: (value: unknown) => ValidationResult | void,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (envVars[varName]) {
            try {
                const result = validator(envVars[varName]);
                if (result && typeof result === 'object' && 'isValid' in result) {
                    // Validator returns ValidationResult (like validateChainId)
                    errors.push(...result.errors);
                    warnings.push(...result.warnings);
                } else {
                    // Validator returns void and throws on error (like other validators)
                    // No error means validation passed
                }
            } catch (error) {
                errors.push(`Invalid ${varName}: ${(error as Error).message}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Check for production security issues
     */
    private static checkProductionSecurity(
        envVars: Record<string, unknown>,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (process.env.NODE_ENV === 'production') {
            if (
                envVars.PROPOSER_PRIVATE_KEY &&
                (envVars.PROPOSER_PRIVATE_KEY as string).length > 10
            ) {
                warnings.push('Private key detected in environment - ensure logs are secure');
            }
        }

        return {
            isValid: true, // Security checks only generate warnings, not errors
            errors,
            warnings,
        };
    }
}


