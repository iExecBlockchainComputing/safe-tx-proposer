"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(config = {}) {
        this.config = {
            level: this.getLogLevelFromEnv(),
            enableConsole: true,
            enableFile: process.env.NODE_ENV === 'production',
            logDirectory: './logs',
            maxFileSize: 10, // 10MB
            maxFiles: 5,
            format: 'json',
            ...config,
        };
        if (this.config.enableFile) {
            this.initializeFileLogging();
        }
    }
    getLogLevelFromEnv() {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        switch (envLevel) {
            case 'ERROR':
                return LogLevel.ERROR;
            case 'WARN':
                return LogLevel.WARN;
            case 'INFO':
                return LogLevel.INFO;
            case 'DEBUG':
                return LogLevel.DEBUG;
            default:
                return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
        }
    }
    initializeFileLogging() {
        if (!this.config.logDirectory) {
            return;
        }
        // Create log directory if it doesn't exist
        if (!fs.existsSync(this.config.logDirectory)) {
            fs.mkdirSync(this.config.logDirectory, { recursive: true });
        }
        // Set up log file path
        const timestamp = new Date().toISOString().split('T')[0];
        this.logFilePath = path.join(this.config.logDirectory, `app-${timestamp}.log`);
        // Rotate logs if needed
        this.rotateLogsIfNeeded();
    }
    rotateLogsIfNeeded() {
        if (!this.logFilePath || !fs.existsSync(this.logFilePath)) {
            return;
        }
        const stats = fs.statSync(this.logFilePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        if (fileSizeMB > (this.config.maxFileSize || 10)) {
            this.rotateLogs();
        }
    }
    rotateLogs() {
        if (!this.config.logDirectory) {
            return;
        }
        const logFiles = fs
            .readdirSync(this.config.logDirectory)
            .filter((file) => file.startsWith('app-') && file.endsWith('.log'))
            .sort()
            .reverse();
        // Remove old log files if we exceed maxFiles
        const maxFiles = this.config.maxFiles || 5;
        if (logFiles.length >= maxFiles) {
            const filesToRemove = logFiles.slice(maxFiles - 1);
            filesToRemove.forEach((file) => {
                if (this.config.logDirectory) {
                    fs.unlinkSync(path.join(this.config.logDirectory, file));
                }
            });
        }
        // Create new log file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFilePath = path.join(this.config.logDirectory, `app-${timestamp}.log`);
    }
    shouldLog(level) {
        return level <= this.config.level;
    }
    formatMessage(level, message, metadata) {
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        if (this.config.format === 'json') {
            const logEntry = {
                timestamp,
                level: levelName,
                message,
                ...(metadata && {
                    metadata: this.sanitizeMetadata(metadata),
                }),
            };
            return JSON.stringify(logEntry);
        }
        else {
            const metadataStr = metadata
                ? ` ${JSON.stringify(this.sanitizeMetadata(metadata))}`
                : '';
            return `[${timestamp}] ${levelName}: ${message}${metadataStr}`;
        }
    }
    /**
     * Sanitize metadata to handle non-serializable values like BigInt
     */
    sanitizeMetadata(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj === 'bigint') {
            return obj.toString();
        }
        if (typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeMetadata(item));
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = this.sanitizeMetadata(value);
        }
        return sanitized;
    }
    writeToFile(formattedMessage) {
        if (!this.config.enableFile || !this.logFilePath) {
            return;
        }
        try {
            fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
            this.rotateLogsIfNeeded();
        }
        catch (error) {
            // Fallback to stderr if file writing fails (avoid using console to prevent lint issues)
            process.stderr.write(`Failed to write to log file: ${String(error)}\n`);
        }
    }
    writeToConsole(level, formattedMessage) {
        if (!this.config.enableConsole) {
            return;
        }
        const colors = {
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.INFO]: '\x1b[36m', // Cyan
            [LogLevel.DEBUG]: '\x1b[37m', // White
        };
        const reset = '\x1b[0m';
        const colorCode = colors[level] || '';
        if (this.config.format === 'json') {
            process.stdout.write(formattedMessage + '\n');
        }
        else {
            process.stdout.write(`${colorCode}${formattedMessage}${reset}\n`);
        }
    }
    log(level, message, metadata) {
        if (!this.shouldLog(level)) {
            return;
        }
        const formattedMessage = this.formatMessage(level, message, metadata);
        this.writeToConsole(level, formattedMessage);
        this.writeToFile(formattedMessage);
    }
    error(message, error) {
        const metadata = {};
        if (error) {
            if (error instanceof Error) {
                metadata.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                };
            }
            else {
                metadata.error = error;
            }
        }
        this.log(LogLevel.ERROR, message, metadata);
    }
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, metadata);
    }
    info(message, metadata) {
        this.log(LogLevel.INFO, message, metadata);
    }
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
}
exports.Logger = Logger;
// Singleton logger instance
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map