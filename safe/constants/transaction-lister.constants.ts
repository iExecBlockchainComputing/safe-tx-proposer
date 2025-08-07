/**
 * Constants for TransactionLister
 */

export const DEFAULTS = {
    TRANSACTION_TYPE: 'pending' as const,
    LIMIT: Number.MAX_SAFE_INTEGER,
} as const;

export const TRANSACTION_TYPES = {
    PENDING: 'pending',
    ALL: 'all',
    INCOMING: 'incoming',
    MULTISIG: 'multisig',
    MODULE: 'module',
} as const;

export const EXECUTION_STATUS = {
    EXECUTED: 'Executed',
    READY: 'Ready',
    PENDING: 'Pending',
} as const;

export const DISPLAY_VALUES = {
    NOT_AVAILABLE: 'N/A',
    UNKNOWN_OWNER: 'Unknown',
    SAFE_WEB_URL: 'https://app.safe.global/',
} as const;

export const CLI_HELP_TEXT = `
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
` as const;
