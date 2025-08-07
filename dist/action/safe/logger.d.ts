export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
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
    enableFile: boolean;
    logDirectory?: string;
    maxFileSize?: number;
    maxFiles?: number;
    format?: 'json' | 'text';
}
export declare class Logger {
    private config;
    private logFilePath?;
    constructor(config?: Partial<LoggerConfig>);
    private getLogLevelFromEnv;
    private initializeFileLogging;
    private rotateLogsIfNeeded;
    private rotateLogs;
    private shouldLog;
    private formatMessage;
    /**
     * Sanitize metadata to handle non-serializable values like BigInt
     */
    private sanitizeMetadata;
    private writeToFile;
    private writeToConsole;
    private log;
    error(message: string, error?: Error | Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map