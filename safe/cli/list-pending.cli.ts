#!/usr/bin/env ts-node

import { validateEnvironment } from '../config';
import { TransactionLister } from '../transaction-lister';
import { ListPendingConsoleUtils } from '../utils/list-pending.console.utils';

async function main(): Promise<void> {
    const parsedArgs = TransactionLister.parseCommandLineArgs();

    try {
        await validateEnvironment();

        const transactionLister = await TransactionLister.create();
        const config = TransactionLister.createConfig(parsedArgs);

        await transactionLister.listTransactions(config);
    } catch (error) {
        ListPendingConsoleUtils.displayError('Error fetching transactions', error);
        process.exit(1);
    }
}

if (require.main === module) {
    void main();
}
