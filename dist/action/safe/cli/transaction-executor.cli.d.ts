#!/usr/bin/env ts-node
/**
 * CLI interface for TransactionExecutor
 */
import type { ExecutionConfig } from '../types/transaction-executor.types';
import { TransactionExecutor } from '../transaction-executor';
/**
 * Parse command line arguments
 */
declare function parseExecutionArgs(args: string[]): Promise<ExecutionConfig>;
/**
 * Validate execution configuration
 */
declare function validateExecutionArgs(config: ExecutionConfig): void;
/**
 * Execute script command
 */
declare function executeScriptCommand(executor: TransactionExecutor, args: string[]): Promise<void>;
/**
 * Display help text
 */
declare function displayHelp(): void;
/**
 * Main CLI function
 */
declare function main(): Promise<void>;
export { parseExecutionArgs, validateExecutionArgs, executeScriptCommand, displayHelp, main, };
//# sourceMappingURL=transaction-executor.cli.d.ts.map