#!/usr/bin/env ts-node

/**
 * List Pending Transactions - Main Export File
 * 
 * This file exports all the components of the list-pending functionality.
 * For execution, use cli/list-pending.cli.ts
 */

export { TransactionLister } from './transaction-lister';
export { ListPendingConsoleUtils } from './utils/list-pending.console.utils';
export * from './types/list-pending.types';
export * from './constants/list-pending.constants';

// Re-export main function for direct execution if needed
export { main } from './cli/list-pending.cli';

// For backward compatibility when this file is executed directly
if (require.main === module) {
    import('./cli/list-pending.cli').then(module => {
        void module.main();
    }).catch(error => {
        console.error('Failed to execute list-pending:', error);
        process.exit(1);
    });
}
