"use strict";
/**
 * Custom Error Classes for Production-Ready Error Handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.ValidationError = exports.SafeTransactionError = exports.ConfigurationError = exports.AppError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // Configuration Errors
    ErrorCode["INVALID_CONFIGURATION"] = "INVALID_CONFIGURATION";
    ErrorCode["INVALID_RPC_URL"] = "INVALID_RPC_URL";
    ErrorCode["INVALID_PRIVATE_KEY"] = "INVALID_PRIVATE_KEY";
    // Safe Transaction Errors
    ErrorCode["SAFE_TRANSACTION_FAILED"] = "SAFE_TRANSACTION_FAILED";
    // File System Errors
    ErrorCode["BROADCAST_FILE_NOT_FOUND"] = "BROADCAST_FILE_NOT_FOUND";
    ErrorCode["FILE_PERMISSION_ERROR"] = "FILE_PERMISSION_ERROR";
    // Validation Errors
    ErrorCode["INVALID_TRANSACTION_DATA"] = "INVALID_TRANSACTION_DATA";
    ErrorCode["INVALID_HEX_VALUE"] = "INVALID_HEX_VALUE";
    ErrorCode["INVALID_ADDRESS"] = "INVALID_ADDRESS";
    // General Errors
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AppError extends Error {
    constructor(message, code = ErrorCode.UNKNOWN_ERROR, statusCode = 500, isOperational = true, context) {
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
exports.AppError = AppError;
class ConfigurationError extends AppError {
    constructor(message, context) {
        super(message, ErrorCode.INVALID_CONFIGURATION, 400, true, context);
    }
}
exports.ConfigurationError = ConfigurationError;
class SafeTransactionError extends AppError {
    constructor(message, code, context) {
        super(message, code, 422, true, context);
    }
}
exports.SafeTransactionError = SafeTransactionError;
class ValidationError extends AppError {
    constructor(message, code, context) {
        super(message, code, 400, true, context);
    }
}
exports.ValidationError = ValidationError;
/**
 * Error Code to Human-Readable Message Mapping
 */
exports.ERROR_MESSAGES = {
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
//# sourceMappingURL=errors.js.map