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
}
export declare class Logger {
    private config;
    constructor(config?: Partial<LoggerConfig>);
    private getLogLevelFromEnv;
    private shouldLog;
    private formatMessage;
    /**
     * Sanitize metadata to handle non-serializable values like BigInt
     */
    private sanitizeMetadata;
    private writeToConsole;
    private log;
    error(message: string, error?: Error | Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map