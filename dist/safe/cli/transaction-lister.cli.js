#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const config_1 = require("../config");
const transaction_lister_1 = require("../transaction-lister");
const transaction_lister_console_utils_1 = require("../utils/transaction-lister.console.utils");
async function main() {
    const parsedArgs = transaction_lister_1.TransactionLister.parseCommandLineArgs();
    try {
        await (0, config_1.validateEnvironment)();
        const transactionLister = await transaction_lister_1.TransactionLister.create();
        const config = transaction_lister_1.TransactionLister.createConfig(parsedArgs);
        await transactionLister.listTransactions(config);
    }
    catch (error) {
        transaction_lister_console_utils_1.ListPendingConsoleUtils.displayError('Error fetching transactions', error);
        process.exit(1);
    }
}
if (require.main === module) {
    void main();
}
//# sourceMappingURL=transaction-lister.cli.js.map