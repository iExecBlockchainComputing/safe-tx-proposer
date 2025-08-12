/**
 * Comprehensive validation utilities for production use
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class Validator {
    /**
     * Validate Ethereum address
     */
    static validateAddress(address: string, fieldName?: string): void;
    /**
     * Validate private key format
     */
    static validatePrivateKey(privateKey: string, fieldName?: string): void;
    /**
     * Validate RPC URL
     */
    static validateRpcUrl(rpcUrl: string, fieldName?: string): void;
    /**
     * Validate chain ID
     */
    static validateChainId(chainId: string | number, fieldName?: string): void;
    /**
     * Validate hex string
     */
    static validateHexString(hex: string, fieldName?: string, expectedLength?: number): void;
    /**
     * Validate transaction data
     */
    static validateTransactionData(txData: {
        to: string;
        value: string;
        data: string;
        operation?: string | number;
    }): void;
    /**
     * Validate transaction value
     */
    private static validateTransactionValue;
    /**
     * Validate transaction data field
     */
    private static validateTransactionData_Data;
    /**
     * Validate transaction operation
     */
    private static validateTransactionOperation;
    /**
     * Validate string operation type
     */
    private static validateStringOperation;
    /**
     * Validate numeric operation type
     */
    private static validateNumericOperation;
    /**
     * Validate environment variables
     */
    static validateEnvironmentVariables(envVars: Record<string, unknown>): ValidationResult;
    /**
     * Validate required environment variables
     */
    private static validateRequiredEnvVars;
    /**
     * Validate environment variable formats
     */
    private static validateEnvVarFormats;
    /**
     * Validate a specific environment variable format
     */
    private static validateEnvVarFormat;
    /**
     * Check for production security issues
     */
    private static checkProductionSecurity;
}
//# sourceMappingURL=validation.d.ts.map