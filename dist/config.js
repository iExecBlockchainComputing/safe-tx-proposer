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
exports.getSafeConfig = getSafeConfig;
exports.getProposerConfig = getProposerConfig;
exports.validateEnvironment = validateEnvironment;
const dotenv_1 = require("dotenv");
const ethers_1 = require("ethers");
const path = __importStar(require("path"));
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const validation_1 = require("./validation");
// Load environment variables from .env
(0, dotenv_1.config)({ path: path.join(__dirname, '../.env') });
async function getSafeConfig() {
    const rpcUrl = process.env.RPC_URL;
    const safeAddress = process.env.SAFE_ADDRESS;
    const apiKey = process.env.SAFE_API_KEY;
    if (!rpcUrl) {
        logger_1.logger.error('Missing required environment variable: RPC_URL');
        throw new errors_1.ConfigurationError('RPC_URL is required in .env', {
            missingVariable: 'RPC_URL',
        });
    }
    if (!safeAddress) {
        logger_1.logger.error('Missing required environment variable: SAFE_ADDRESS');
        throw new errors_1.ConfigurationError('SAFE_ADDRESS is required in .env', {
            missingVariable: 'SAFE_ADDRESS',
        });
    }
    if (!apiKey) {
        logger_1.logger.error('Missing required environment variable: SAFE_API_KEY');
        throw new errors_1.ConfigurationError('SAFE_API_KEY is required in .env', {
            missingVariable: 'SAFE_API_KEY',
        });
    }
    // Get chain ID from RPC URL
    let chainId;
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        chainId = network.chainId;
        logger_1.logger.info('Chain ID retrieved from RPC', { chainId: chainId.toString() });
    }
    catch (error) {
        logger_1.logger.error('Failed to get chain ID from RPC URL', error);
        throw new errors_1.ConfigurationError('Could not retrieve chain ID from RPC URL', {
            rpcUrl,
            error: error.message,
        });
    }
    // Validate configuration
    try {
        validation_1.Validator.validateRpcUrl(rpcUrl);
        validation_1.Validator.validateAddress(safeAddress, 'SAFE_ADDRESS');
        validation_1.Validator.validateChainId(chainId.toString());
        logger_1.logger.info('Safe configuration validated successfully', {
            chainId: chainId.toString(),
            rpcUrl: rpcUrl.substring(0, 20) + '...', // Log truncated URL for security
            safeAddress,
        });
    }
    catch (error) {
        logger_1.logger.error('Invalid Safe configuration', error);
        throw error;
    }
    return {
        rpcUrl,
        chainId,
        safeAddress,
        apiKey,
    };
}
function getProposerConfig() {
    const privateKey = process.env[`PROPOSER_PRIVATE_KEY`];
    if (!privateKey) {
        logger_1.logger.error('Missing required proposer configuration');
        throw new errors_1.ConfigurationError(`PROPOSER_PRIVATE_KEY is required in .env`, {
            missingPrivateKey: !privateKey,
        });
    }
    // Validate private key configuration
    try {
        validation_1.Validator.validatePrivateKey(privateKey, 'PROPOSER_PRIVATE_KEY');
        // Derive address from private key using ethers
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        const address = wallet.address;
        logger_1.logger.info('Proposer configuration validated successfully', {
            address,
            privateKeyLength: privateKey.length,
        });
        return {
            address,
            privateKey,
        };
    }
    catch (error) {
        logger_1.logger.error('Invalid proposer configuration', error);
        throw error;
    }
}
async function validateEnvironment() {
    logger_1.logger.info('Validating environment configuration...');
    try {
        await getSafeConfig();
        getProposerConfig();
        // Additional validation
        const envValidation = validation_1.Validator.validateEnvironmentVariables(process.env);
        if (!envValidation.isValid) {
            logger_1.logger.error('Environment validation failed', { errors: envValidation.errors });
            throw new errors_1.ConfigurationError(`Environment validation failed: ${envValidation.errors.join(', ')}`, { validationErrors: envValidation.errors });
        }
        if (envValidation.warnings.length > 0) {
            logger_1.logger.warn('Environment validation warnings', { warnings: envValidation.warnings });
        }
        logger_1.logger.info('Environment validation completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Environment validation failed', error);
        throw error;
    }
}
//# sourceMappingURL=config.js.map