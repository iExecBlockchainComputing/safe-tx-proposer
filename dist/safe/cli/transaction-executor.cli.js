#!/usr/bin/env ts-node
"use strict";
/**
 * CLI interface for TransactionExecutor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExecutionArgs = parseExecutionArgs;
exports.validateExecutionArgs = validateExecutionArgs;
exports.executeScriptCommand = executeScriptCommand;
exports.displayHelp = displayHelp;
exports.main = main;
const config_1 = require("../config");
const transaction_executor_constants_1 = require("../constants/transaction-executor.constants");
const utils_1 = require("../utils/utils");
const transaction_executor_1 = require("../transaction-executor");
/**
 * Parse command line arguments
 */
async function parseExecutionArgs(args) {
    const config = {
        dryRun: false,
        rpcUrl: transaction_executor_constants_1.DEFAULTS.RPC_URL
    };
    // Get Safe configuration to automatically set forge options
    const safeConfig = await (0, config_1.getSafeConfig)();
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
function validateExecutionArgs(config) {
    const hasValidConfig = Boolean(config.forgeScript ||
        config.smartContract ||
        config.envVars);
    if (!hasValidConfig) {
        console.error('Error: Either --forge-script, --smart-contract, or --env-vars is required');
        process.exit(1);
    }
}
/**
 * Execute script command
 */
async function executeScriptCommand(executor, args) {
    const config = await parseExecutionArgs(args);
    validateExecutionArgs(config);
    await executor.executeFromScript(config);
}
/**
 * Display help text
 */
function displayHelp() {
    console.log(`${transaction_executor_constants_1.CLI_HELP_TEXT}

Available scripts: ${(0, utils_1.getAvailableScripts)().join(', ')}
    `);
}
/**
 * Main CLI function
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        displayHelp();
        process.exit(1);
    }
    try {
        await (0, config_1.validateEnvironment)();
        const executor = await transaction_executor_1.TransactionExecutor.create();
        await executeScriptCommand(executor, args);
    }
    catch (error) {
        console.error('Execution failed:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=transaction-executor.cli.js.map