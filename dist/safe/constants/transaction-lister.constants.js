"use strict";
/**
 * Constants for TransactionLister
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI_HELP_TEXT = exports.DISPLAY_VALUES = exports.EXECUTION_STATUS = exports.TRANSACTION_TYPES = exports.DEFAULTS = void 0;
exports.DEFAULTS = {
    TRANSACTION_TYPE: 'pending',
    LIMIT: Number.MAX_SAFE_INTEGER,
};
exports.TRANSACTION_TYPES = {
    PENDING: 'pending',
    ALL: 'all',
    INCOMING: 'incoming',
    MULTISIG: 'multisig',
    MODULE: 'module',
};
exports.EXECUTION_STATUS = {
    EXECUTED: 'Executed',
    READY: 'Ready',
    PENDING: 'Pending',
};
exports.DISPLAY_VALUES = {
    NOT_AVAILABLE: 'N/A',
    UNKNOWN_OWNER: 'Unknown',
    SAFE_WEB_URL: 'https://app.safe.global/',
};
exports.CLI_HELP_TEXT = `
Transaction Lister - List Safe transactions

Usage: npm run safe:transaction-lister [options]

Options:
  --type <type>           Transaction type to list:
                          - pending: Pending transactions (default)
                          - all: All transactions
                          - incoming: Incoming transactions
                          - multisig: Multisig transactions
                          - module: Module transactions
  --limit <number>        Limit number of results

Examples:
  npm run safe:transaction-lister
  npm run safe:transaction-lister -- --type all
  npm run safe:transaction-lister -- --type pending --limit 10
`;
//# sourceMappingURL=transaction-lister.constants.js.map