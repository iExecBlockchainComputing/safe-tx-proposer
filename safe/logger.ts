import * as fs from 'fs';
import * as path from 'path';

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
    enableFile: boolean;
    logDirectory?: string;
    maxFileSize?: number; // in MB
    maxFiles?: number;
    format?: 'json' | 'text';
}

export class Logger {
    private config: LoggerConfig;
    private logFilePath?: string;

    constructor(config: Partial<LoggerConfig> = {}) {
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

    private initializeFileLogging(): void {
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

    private rotateLogsIfNeeded(): void {
        if (!this.logFilePath || !fs.existsSync(this.logFilePath)) {
            return;
        }

        const stats = fs.statSync(this.logFilePath);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > (this.config.maxFileSize || 10)) {
            this.rotateLogs();
        }
    }

    private rotateLogs(): void {
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

    private shouldLog(level: LogLevel): boolean {
        return level <= this.config.level;
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        metadata?: Record<string, unknown>,
    ): string {
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];

        if (this.config.format === 'json') {
            const logEntry: LogEntry = {
                timestamp,
                level: levelName,
                message,
                ...(metadata && {
                    metadata: this.sanitizeMetadata(metadata) as Record<string, unknown>,
                }),
            };
            return JSON.stringify(logEntry);
        } else {
            const metadataStr = metadata
                ? ` ${JSON.stringify(this.sanitizeMetadata(metadata))}`
                : '';
            return `[${timestamp}] ${levelName}: ${message}${metadataStr}`;
        }
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

    private writeToFile(formattedMessage: string): void {
        if (!this.config.enableFile || !this.logFilePath) {
            return;
        }

        try {
            fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
            this.rotateLogsIfNeeded();
        } catch (error) {
            // Fallback to stderr if file writing fails (avoid using console to prevent lint issues)
            process.stderr.write(`Failed to write to log file: ${String(error)}\n`);
        }
    }

    private writeToConsole(level: LogLevel, formattedMessage: string): void {
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
        } else {
            process.stdout.write(`${colorCode}${formattedMessage}${reset}\n`);
        }
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, metadata);

        this.writeToConsole(level, formattedMessage);
        this.writeToFile(formattedMessage);
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
