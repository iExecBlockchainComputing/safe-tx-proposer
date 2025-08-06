/**
 * Constants for TransactionExecutor
 */

export const DEFAULTS = {
    RPC_URL: 'http://localhost:8545',
    SCRIPT_NAME: 'IexecLayerZeroBridge',
    SCRIPT_PATH: 'script/bridges/layerZero/IexecLayerZeroBridge.s.sol',
    SMART_CONTRACT: 'Configure',
    ANVIL_STARTUP_DELAY: 5000,
    TRANSACTION_DELAY: 1000,
} as const;

export const FORGE_COMMAND = {
    COMMAND: 'forge',
    SUBCOMMAND: 'script',
    FLAGS: {
        RPC_URL: '--rpc-url',
        BROADCAST: '--broadcast',
        VERBOSE: '-vvv',
    },
} as const;

export const TRANSACTION_TYPES = {
    CALL: 'CALL',
    DEPLOY: 'DEPLOY',
} as const;

export const CLI_HELP_TEXT = `
Transaction Executor

Usage: npm run safe:execute -- [options]

Script execution options:
  --rpc-url <url>         RPC URL (default: ${DEFAULTS.RPC_URL})
  --script <name>         Script name for broadcast file (default: ${DEFAULTS.SCRIPT_NAME})
  --forge-script <path>   Forge script path (default: ${DEFAULTS.SCRIPT_PATH}:${DEFAULTS.SMART_CONTRACT})
  --smart-contract <name> Smart contract name (default: ${DEFAULTS.SMART_CONTRACT})
  --env-vars <vars>       Environment variables as string: "KEY1=value1 KEY2=value2"
  --forge-options <opts>  Additional forge options
  --dry-run              Show transactions without executing

Examples:
  npm run safe:execute -- --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY --env-vars "SOURCE_CHAIN=sepolia TARGET_CHAIN=arbitrum-sepolia"
  npm run safe:execute -- --rpc-url https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY --smart-contract Deploy
  npm run safe:execute -- --rpc-url http://localhost:8545 --forge-script "script/bridges/layerZero/IexecLayerZeroBridge.s.sol:Configure"
`;
