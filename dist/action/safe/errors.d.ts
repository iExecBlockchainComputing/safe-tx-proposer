/**
 * Custom Error Classes for Production-Ready Error Handling
 */
export declare enum ErrorCode {
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
    INVALID_RPC_URL = "INVALID_RPC_URL",
    INVALID_PRIVATE_KEY = "INVALID_PRIVATE_KEY",
    SAFE_TRANSACTION_FAILED = "SAFE_TRANSACTION_FAILED",
    BROADCAST_FILE_NOT_FOUND = "BROADCAST_FILE_NOT_FOUND",
    FILE_PERMISSION_ERROR = "FILE_PERMISSION_ERROR",
    INVALID_TRANSACTION_DATA = "INVALID_TRANSACTION_DATA",
    INVALID_HEX_VALUE = "INVALID_HEX_VALUE",
    INVALID_ADDRESS = "INVALID_ADDRESS",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly timestamp: Date;
    readonly context?: Record<string, unknown>;
    constructor(message: string, code?: ErrorCode, statusCode?: number, isOperational?: boolean, context?: Record<string, unknown>);
}
export declare class ConfigurationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class SafeTransactionError extends AppError {
    constructor(message: string, code: ErrorCode, context?: Record<string, unknown>);
}
export declare class ValidationError extends AppError {
    constructor(message: string, code: ErrorCode, context?: Record<string, unknown>);
}
/**
 * Error Code to Human-Readable Message Mapping
 */
export declare const ERROR_MESSAGES: Record<ErrorCode, string>;
//# sourceMappingURL=errors.d.ts.map