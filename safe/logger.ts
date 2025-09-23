import winston from 'winston';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
}

export class Logger {
    private winstonLogger: winston.Logger;

    constructor(config: Partial<LoggerConfig> = {}) {
        const logLevel = this.getLogLevelFromEnv();
        const enableConsole = config.enableConsole ?? true;
        
        this.winstonLogger = winston.createLogger({
            level: this.mapLogLevelToWinston(logLevel),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
                winston.format.printf((info) => {
                    // Custom format to handle metadata sanitization
                    const sanitized = this.sanitizeLogInfo(info);
                    return JSON.stringify(sanitized);
                })
            ),
            transports: enableConsole ? [
                new winston.transports.Console({
                    stderrLevels: ['error', 'warn'],
                    format: process.env.NODE_ENV !== 'production' 
                        ? winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        )
                        : winston.format.json()
                })
            ] : [],
            silent: !enableConsole
        });
    }

    private getLogLevelFromEnv(): LogLevel {
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

    private mapLogLevelToWinston(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR:
                return 'error';
            case LogLevel.WARN:
                return 'warn';
            case LogLevel.INFO:
                return 'info';
            case LogLevel.DEBUG:
                return 'debug';
            default:
                return 'info';
        }
    }

    private sanitizeLogInfo(info: any): any {
        const sanitized = { ...info };
        
        // Sanitize all properties in the log info
        Object.keys(sanitized).forEach(key => {
            if (key !== 'level' && key !== 'message' && key !== 'timestamp') {
                sanitized[key] = this.sanitizeMetadata(sanitized[key]);
            }
        });
        
        return sanitized;
    }

    /**
     * Sanitize metadata to handle non-serializable values like BigInt
     */
    private sanitizeMetadata(obj: unknown): unknown {
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

        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            sanitized[key] = this.sanitizeMetadata(value);
        }

        return sanitized;
    }

    error(message: string, error?: Error | Record<string, unknown>): void {
        const logData: any = { message };

        if (error) {
            if (error instanceof Error) {
                logData.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                };
            } else {
                logData.error = this.sanitizeMetadata(error);
            }
        }

        this.winstonLogger.error(logData);
    }

    warn(message: string, metadata?: Record<string, unknown>): void {
        const logData: any = { message };
        if (metadata) {
            Object.assign(logData, this.sanitizeMetadata(metadata));
        }
        this.winstonLogger.warn(logData);
    }

    info(message: string, metadata?: Record<string, unknown>): void {
        const logData: any = { message };
        if (metadata) {
            Object.assign(logData, this.sanitizeMetadata(metadata));
        }
        this.winstonLogger.info(logData);
    }

    debug(message: string, metadata?: Record<string, unknown>): void {
        const logData: any = { message };
        if (metadata) {
            Object.assign(logData, this.sanitizeMetadata(metadata));
        }
        this.winstonLogger.debug(logData);
    }
}

// Singleton logger instance
export const logger = new Logger();
