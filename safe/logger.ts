export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    metadata?: Record<string, unknown>;
    error?: Record<string, unknown>;
}

export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
}

export class Logger {
    private config: LoggerConfig;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            level: this.getLogLevelFromEnv(),
            enableConsole: true,
            ...config,
        };
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

    private shouldLog(level: LogLevel): boolean {
        return level <= this.config.level;
    }

    private formatMessage(level: LogLevel, message: string, metadata?: Record<string, unknown>): string {
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        
        const logEntry: LogEntry = {
            timestamp,
            level: levelName,
            message,
            ...(metadata && {
                metadata: this.sanitizeMetadata(metadata) as Record<string, unknown>,
            }),
        };
        return JSON.stringify(logEntry);
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

    private writeToConsole(level: LogLevel, formattedMessage: string): void {
        if (!this.config.enableConsole) {
            return;
        }

        process.stdout.write(formattedMessage + '\n');
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, metadata);
        this.writeToConsole(level, formattedMessage);
    }

    error(message: string, error?: Error | Record<string, unknown>): void {
        const metadata: Record<string, unknown> = {};

        if (error) {
            if (error instanceof Error) {
                metadata.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                };
            } else {
                metadata.error = error;
            }
        }

        this.log(LogLevel.ERROR, message, metadata);
    }

    warn(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, metadata);
    }

    info(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, metadata);
    }

    debug(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, metadata);
    }
}

// Singleton logger instance
export const logger = new Logger();
