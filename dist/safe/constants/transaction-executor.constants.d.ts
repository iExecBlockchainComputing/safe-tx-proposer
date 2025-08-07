/**
 * Constants for TransactionExecutor
 */
export declare const DEFAULTS: {
    readonly RPC_URL: "http://localhost:8545";
    readonly SCRIPT_NAME: "IexecLayerZeroBridge";
    readonly SCRIPT_PATH: "script/bridges/layerZero/IexecLayerZeroBridge.s.sol";
    readonly SMART_CONTRACT: "Configure";
    readonly ANVIL_STARTUP_DELAY: 5000;
    readonly TRANSACTION_DELAY: 1000;
};
export declare const FORGE_COMMAND: {
    readonly COMMAND: "forge";
    readonly SUBCOMMAND: "script";
    readonly FLAGS: {
        readonly RPC_URL: "--rpc-url";
        readonly BROADCAST: "--broadcast";
        readonly VERBOSE: "-vvv";
    };
};
export declare const TRANSACTION_TYPES: {
    readonly CALL: "CALL";
    readonly DEPLOY: "DEPLOY";
};
export declare const CLI_HELP_TEXT: string;
//# sourceMappingURL=transaction-executor.constants.d.ts.map