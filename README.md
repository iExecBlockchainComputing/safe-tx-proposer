# Safe Transaction Proposer

A TypeScript library for interacting with Safe multisig wallets to propose and execute transactions.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.template .env
# Edit .env with your configuration
```

3. **Test transaction proposal:**
```bash
npm run safe:execute -- --script SafeOperations --smart-contract SafeOperations --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

This command will propose a transaction using the script from `broadcast/SafeOperations.s.sol/11155111/run-latest.json`.

## Configuration

Required environment variables in `.env`:

```bash
# Network
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Safe
SAFE_ADDRESS=0x...
SAFE_API_KEY=YOUR_API_KEY

# Proposer
PROPOSER_PRIVATE_KEY=...
```

## Basic Commands

```bash
# Build
npm run build

# List pending transactions
npm run safe:list-pending

# Run tests
npm test
```

## Programmatic Usage

```typescript
import { SafeManager } from 'safe-tx-proposer';

const safeManager = await SafeManager.create();
const pendingTxs = await safeManager.listPendingTransactions();
```

## License

MIT
