/**
 * Constants for TransactionLister
 */
export declare const DEFAULTS: {
    readonly TRANSACTION_TYPE: "pending";
    readonly LIMIT: number;
};
export declare const TRANSACTION_TYPES: {
    readonly PENDING: "pending";
    readonly ALL: "all";
    readonly INCOMING: "incoming";
    readonly MULTISIG: "multisig";
    readonly MODULE: "module";
};
export declare const EXECUTION_STATUS: {
    readonly EXECUTED: "Executed";
    readonly READY: "Ready";
    readonly PENDING: "Pending";
};
export declare const DISPLAY_VALUES: {
    readonly NOT_AVAILABLE: "N/A";
    readonly UNKNOWN_OWNER: "Unknown";
    readonly SAFE_WEB_URL: "https://app.safe.global/";
};
export declare const CLI_HELP_TEXT: "\nTransaction Lister - List Safe transactions\n\nUsage: npm run safe:transaction-lister [options]\n\nOptions:\n  --type <type>           Transaction type to list:\n                          - pending: Pending transactions (default)\n                          - all: All transactions\n                          - incoming: Incoming transactions\n                          - multisig: Multisig transactions\n                          - module: Module transactions\n  --limit <number>        Limit number of results\n\nExamples:\n  npm run safe:transaction-lister\n  npm run safe:transaction-lister -- --type all\n  npm run safe:transaction-lister -- --type pending --limit 10\n";
//# sourceMappingURL=transaction-lister.constants.d.ts.map