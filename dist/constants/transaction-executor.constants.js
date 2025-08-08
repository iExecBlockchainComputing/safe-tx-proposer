"use strict";
/**
 * Constants for TransactionExecutor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI_HELP_TEXT = exports.TRANSACTION_TYPES = exports.FORGE_COMMAND = exports.DEFAULTS = void 0;
exports.DEFAULTS = {
    RPC_URL: 'http://localhost:8545',
    SCRIPT_NAME: 'IexecLayerZeroBridge',
    SCRIPT_PATH: 'script/bridges/layerZero/IexecLayerZeroBridge.s.sol',
    SMART_CONTRACT: 'Configure',
    ANVIL_STARTUP_DELAY: 5000,
    TRANSACTION_DELAY: 1000,
};
exports.FORGE_COMMAND = {
    COMMAND: 'forge',
    SUBCOMMAND: 'script',
    FLAGS: {
        RPC_URL: '--rpc-url',
        BROADCAST: '--broadcast',
        VERBOSE: '-vvv',
    },
};
exports.TRANSACTION_TYPES = {
    CALL: 'CALL',
    DEPLOY: 'DEPLOY',
};
exports.CLI_HELP_TEXT = `
Transaction Executor

Usage: npm run safe:execute -- [options]

Script execution options:
  --rpc-url <url>         RPC URL (default: ${exports.DEFAULTS.RPC_URL})
  --script <n>         Script name for broadcast file (default: ${exports.DEFAULTS.SCRIPT_NAME})
  --forge-script <path>   Forge script path (default: ${exports.DEFAULTS.SCRIPT_PATH}:${exports.DEFAULTS.SMART_CONTRACT})
  --smart-contract <n> Smart contract name (default: ${exports.DEFAULTS.SMART_CONTRACT})
  --env-vars <vars>       Environment variables as string: "KEY1=value1 KEY2=value2"
  --dry-run              Show transactions without executing

Note: Forge options are automatically set to "--unlocked --sender <SAFE_ADDRESS>" from your .env configuration.

Examples:
  npm run safe:execute -- --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY --env-vars "SOURCE_CHAIN=sepolia TARGET_CHAIN=arbitrum-sepolia"
  npm run safe:execute -- --rpc-url https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY --smart-contract Deploy
  npm run safe:execute -- --rpc-url http://localhost:8545 --forge-script "script/bridges/layerZero/IexecLayerZeroBridge.s.sol:Configure"
`;
//# sourceMappingURL=transaction-executor.constants.js.map