/**
 * Main entry point that can be used as CLI
 */

import { main } from './cli/transaction-executor.cli';

if (require.main === module) {
    main().catch(console.error);
}
