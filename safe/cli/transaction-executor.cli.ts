#!/usr/bin/env ts-node

/**
 * CLI interface for TransactionExecutor
 */

import { validateEnvironment, getSafeConfig } from '../config';
import { CLI_HELP_TEXT, DEFAULTS } from '../constants/transaction-executor.constants';
import type { ExecutionConfig } from '../types/transaction-executor.types';
import { getAvailableScripts } from '../utils/utils';
import { TransactionExecutor } from '../transaction-executor';

/**
 * Parse command line arguments
 */
async function parseExecutionArgs(args: string[]): Promise<ExecutionConfig> {
    const config: ExecutionConfig = { 
        dryRun: false, 
        rpcUrl: DEFAULTS.RPC_URL 
    };

    // Get Safe configuration to automatically set forge options
    const safeConfig = await getSafeConfig();
    const defaultForgeOptions = `--unlocked --sender ${safeConfig.safeAddress}`;
    config.forgeOptions = defaultForgeOptions;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--rpc-url':
                config.rpcUrl = args[++i];
                break;
            case '--script':
                config.scriptName = args[++i];
                break;
            case '--forge-script':
                config.forgeScript = args[++i];
                break;
            case '--smart-contract':
                config.smartContract = args[++i];
                break;
            case '--env-vars':
                config.envVars = args[++i];
                break;
            case '--dry-run':
                config.dryRun = true;
                break;
        }
    }

    return config;
}

/**
 * Validate execution configuration
 */
function validateExecutionArgs(config: ExecutionConfig): void {
    const hasValidConfig = Boolean(
        config.forgeScript || 
        config.smartContract || 
        config.envVars
    );

    if (!hasValidConfig) {
        console.error('Error: Either --forge-script, --smart-contract, or --env-vars is required');
        process.exit(1);
    }
}

/**
 * Execute script command
 */
async function executeScriptCommand(executor: TransactionExecutor, args: string[]): Promise<void> {
    const config = await parseExecutionArgs(args);
    validateExecutionArgs(config);
    await executor.executeFromScript(config);
}

/**
 * Display help text
 */
function displayHelp(): void {
    console.log(`${CLI_HELP_TEXT}

Available scripts: ${getAvailableScripts().join(', ')}
    `);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        displayHelp();
        process.exit(1);
    }

    try {
        await validateEnvironment();

        const executor = await TransactionExecutor.create();
        await executeScriptCommand(executor, args);
    } catch (error) {
        console.error('Execution failed:', error);
        process.exit(1);
    }
}

// Export for testing and reuse
export {
    parseExecutionArgs,
    validateExecutionArgs,
    executeScriptCommand,
    displayHelp,
    main,
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
