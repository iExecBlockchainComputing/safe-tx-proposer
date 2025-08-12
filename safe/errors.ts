/**
 * Custom Error Classes for Production-Ready Error Handling
 */

export enum ErrorCode {
    // Configuration Errors
    INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
    INVALID_RPC_URL = 'INVALID_RPC_URL',
    INVALID_PRIVATE_KEY = 'INVALID_PRIVATE_KEY',

    // Safe Transaction Errors
    SAFE_TRANSACTION_FAILED = 'SAFE_TRANSACTION_FAILED',

    // File System Errors
    BROADCAST_FILE_NOT_FOUND = 'BROADCAST_FILE_NOT_FOUND',
    FILE_PERMISSION_ERROR = 'FILE_PERMISSION_ERROR',

    // Validation Errors
    INVALID_TRANSACTION_DATA = 'INVALID_TRANSACTION_DATA',
    INVALID_HEX_VALUE = 'INVALID_HEX_VALUE',
    INVALID_ADDRESS = 'INVALID_ADDRESS',

    // General Errors
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, unknown>,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.context = context || {};

        // Maintain proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ConfigurationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, ErrorCode.INVALID_CONFIGURATION, 400, true, context);
    }
}

export class SafeTransactionError extends AppError {
    constructor(message: string, code: ErrorCode, context?: Record<string, unknown>) {
        super(message, code, 422, true, context);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code: ErrorCode, context?: Record<string, unknown>) {
        super(message, code, 400, true, context);
    }
}

/**
 * Error Code to Human-Readable Message Mapping
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_CONFIGURATION]: 'Invalid configuration provided',
    [ErrorCode.INVALID_RPC_URL]: 'Invalid or unreachable RPC URL',
    [ErrorCode.INVALID_PRIVATE_KEY]: 'Invalid private key format',

    [ErrorCode.SAFE_TRANSACTION_FAILED]: 'Safe transaction execution failed',

    [ErrorCode.BROADCAST_FILE_NOT_FOUND]: 'Foundry broadcast file not found',
    [ErrorCode.FILE_PERMISSION_ERROR]: 'File permission denied',

    [ErrorCode.INVALID_TRANSACTION_DATA]: 'Invalid transaction data format',
    [ErrorCode.INVALID_HEX_VALUE]: 'Invalid hexadecimal value',
    [ErrorCode.INVALID_ADDRESS]: 'Invalid Ethereum address',

    [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
};
