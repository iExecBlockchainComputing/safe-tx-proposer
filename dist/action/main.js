#!/usr/bin/env node
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
exports.GitHubActionRunner = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const config_1 = require("../safe/config");
const logger_1 = require("../safe/logger");
const transaction_executor_1 = require("../safe/transaction-executor");
const utils_1 = require("../safe/utils/utils");
class GitHubActionRunner {
    constructor() {
        this.inputs = this.parseInputs();
    }
    parseInputs() {
        return {
            safeAddress: core.getInput('safe-address', { required: true }),
            rpcUrl: core.getInput('rpc-url', { required: true }),
            proposerPrivateKey: core.getInput('proposer-private-key', { required: true }),
            safeApiKey: core.getInput('safe-api-key'),
            foundryScriptPath: core.getInput('foundry-script-path', { required: true }),
            dryRun: core.getBooleanInput('dry-run') || false,
        };
    }
    setupEnvironment() {
        // Create environment configuration for the Safe integration
        const envConfig = `
            SAFE_ADDRESS=${this.inputs.safeAddress}
            RPC_URL=${this.inputs.rpcUrl}
            PROPOSER_PRIVATE_KEY=${this.inputs.proposerPrivateKey}
            SAFE_API_KEY=${this.inputs.safeApiKey}
        `.trim();
        // Write environment configuration to a temporary file
        (0, fs_1.writeFileSync)('.env.safe', envConfig);
        // Set environment variables for the process
        process.env.SAFE_ADDRESS = this.inputs.safeAddress;
        process.env.RPC_URL = this.inputs.rpcUrl;
        process.env.PROPOSER_PRIVATE_KEY = this.inputs.proposerPrivateKey;
        process.env.SAFE_API_KEY = this.inputs.safeApiKey;
        logger_1.logger.info('Environment configured for GitHub Action', {
            safeAddress: this.inputs.safeAddress,
            dryRun: this.inputs.dryRun,
        });
    }
    async validateInputs() {
        try {
            await (0, config_1.validateEnvironment)();
            // Validate chain ID matches network
            const chainId = await (0, utils_1.getChainIdFromRpc)(this.inputs.rpcUrl);
            logger_1.logger.info('Validated RPC connection', { chainId });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown validation error';
            core.setFailed(`Input validation failed: ${message}`);
            throw error;
        }
    }
    async proposeTransaction() {
        logger_1.logger.info('Starting transaction proposal', {
            scriptPath: this.inputs.foundryScriptPath,
            dryRun: this.inputs.dryRun,
        });
        const executor = await transaction_executor_1.TransactionExecutor.create();
        try {
            // Get Safe configuration to set forge options like the CLI does
            const safeConfig = await (0, config_1.getSafeConfig)();
            const defaultForgeOptions = `--unlocked --sender ${safeConfig.safeAddress}`;
            // Configure execution parameters based on inputs
            // Handle the case where foundryScriptPath already contains contract name
            const scriptPath = this.inputs.foundryScriptPath;
            let forgeScript;
            let smartContract;
            if (scriptPath.includes(':')) {
                // Script path already contains contract name (e.g., "script/Test.s.sol:TestContract")
                forgeScript = scriptPath;
                // Extract just the script file path for the config
                const parts = scriptPath.split(':');
                const actualScriptPath = parts[0];
                smartContract = parts[1];
                const executionConfig = {
                    dryRun: this.inputs.dryRun,
                    rpcUrl: this.inputs.rpcUrl,
                    forgeScript: actualScriptPath, // Just the file path
                    smartContract: smartContract, // The contract name
                    forgeOptions: defaultForgeOptions,
                };
                const transactionHashes = await executor.executeFromScript(executionConfig);
                // Set action outputs
                if (transactionHashes && transactionHashes.length > 0) {
                    core.setOutput('transaction-hash', transactionHashes[0]);
                    core.setOutput('transaction-hashes', JSON.stringify(transactionHashes));
                }
                core.setOutput('status', 'success');
                core.setOutput('transaction-count', transactionHashes.length.toString());
                logger_1.logger.info('Transaction proposal completed successfully', {
                    transactionCount: transactionHashes.length,
                    hashes: transactionHashes,
                });
            }
            else {
                // Original behavior for backward compatibility
                const executionConfig = {
                    dryRun: this.inputs.dryRun,
                    rpcUrl: this.inputs.rpcUrl,
                    forgeScript: scriptPath,
                    forgeOptions: defaultForgeOptions,
                };
                const transactionHashes = await executor.executeFromScript(executionConfig);
                // Set action outputs
                if (transactionHashes && transactionHashes.length > 0) {
                    core.setOutput('transaction-hash', transactionHashes[0]);
                    core.setOutput('transaction-hashes', JSON.stringify(transactionHashes));
                }
                core.setOutput('status', 'success');
                core.setOutput('transaction-count', transactionHashes.length.toString());
                logger_1.logger.info('Transaction proposal completed successfully', {
                    transactionCount: transactionHashes.length,
                    hashes: transactionHashes,
                });
            }
        }
        catch (error) {
            core.setOutput('status', 'failed');
            throw error;
        }
    }
    async run() {
        try {
            core.info('🚀 Starting Safe Multisig Transaction Proposer Action');
            // Setup environment and validate inputs
            this.setupEnvironment();
            await this.validateInputs();
            // Execute the requested action
            await this.proposeTransaction();
            core.info('✅ Action completed successfully');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            core.setFailed(`Action failed: ${message}`);
            logger_1.logger.error('GitHub Action failed', {
                error: message,
                stack: error instanceof Error ? error.stack : undefined,
            });
            process.exit(1);
        }
    }
}
exports.GitHubActionRunner = GitHubActionRunner;
// Execute the action
if (require.main === module) {
    const runner = new GitHubActionRunner();
    runner.run().catch((error) => {
        logger_1.logger.error('Unhandled error in GitHub Action:', error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
    });
}
//# sourceMappingURL=main.js.map