"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
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
            ...config,
        };
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
    shouldLog(level) {
        return level <= this.config.level;
    }
    formatMessage(level, message, metadata) {
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
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
    writeToConsole(level, formattedMessage) {
        if (!this.config.enableConsole) {
            return;
        }
        process.stdout.write(formattedMessage + '\n');
    }
    log(level, message, metadata) {
        if (!this.shouldLog(level)) {
            return;
        }
        const formattedMessage = this.formatMessage(level, message, metadata);
        this.writeToConsole(level, formattedMessage);
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