# Safe Transaction Proposer

Safe Multisig Integration for RLC Multichain Bridge - A TypeScript library for interacting with Safe multisig wallets to propose and execute transactions.

## Features

- 🔐 **Safe Multisig Integration**: Complete integration with Safe Protocol Kit and API Kit
- 🌐 **Multi-chain Support**: Works across different Ethereum networks
- 📝 **Transaction Management**: Propose, list, and execute Safe transactions
- ⚡ **TypeScript First**: Full TypeScript support with type safety
- 🔍 **Validation**: Comprehensive input validation and error handling
- 📊 **Logging**: Structured logging with configurable levels

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Fill in your configuration in `.env`:
```bash
# Network configuration
RPC_URL=https://gateway.tenderly.co/public/sepolia

# Safe configuration
SAFE_ADDRESS=0x...
SAFE_API_KEY=YOUR_API_KEY

# Proposer configuration
PROPOSER_PRIVATE_KEY=...
```

## Usage

### Development Scripts

```bash
# Build the project
npm run build

# Start development with watch mode
npm run dev

# Run in watch mode (rebuild on changes)
npm run build:watch

# Type checking without compilation
npm run type-check
```

### Safe Operations

```bash
# List pending transactions
npm run safe:list-pending

# Execute transactions
npm run safe:execute

# Validate configuration
npm run safe:validate
```

### Testing and Quality

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clean build artifacts
npm run clean
```

### Programmatic Usage

```typescript
import { SafeManager, getSafeConfig, validateEnvironment } from 'safe-tx-proposer';

// Validate environment configuration
await validateEnvironment();

// Create Safe manager instance
const safeManager = await SafeManager.create();

// List pending transactions
const pendingTxs = await safeManager.listPendingTransactions();

// Propose a new transaction
await safeManager.proposeTransaction(metaTransactionData);
```

## Project Structure

```
safe/
├── index.ts              # Main exports
├── config.ts             # Environment configuration
├── safe-manager.ts       # Core Safe integration logic
├── transaction-executor.ts # Transaction execution utilities
├── list-pending.ts       # List pending transactions
├── validation.ts         # Input validation
├── errors.ts            # Custom error definitions
├── logger.ts            # Logging configuration
├── utils.ts             # Utility functions
└── anvil-manager.ts     # Anvil local network manager
```

## API Reference

### SafeManager

Main class for interacting with Safe multisig wallets.

#### Methods

- `create()` - Create a new SafeManager instance
- `listPendingTransactions()` - Get pending transactions
- `proposeTransaction(data)` - Propose a new transaction
- `executeTransaction(hash)` - Execute a transaction

### Configuration

- `getSafeConfig()` - Get Safe configuration from environment
- `getProposerConfig()` - Get proposer configuration
- `validateEnvironment()` - Validate all required environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RPC_URL` | Ethereum RPC endpoint | ✅ |
| `SAFE_ADDRESS` | Safe multisig wallet address | ✅ |
| `SAFE_API_KEY` | Safe API key for API access | ✅ |
| `PROPOSER_PRIVATE_KEY` | Private key for transaction proposer | ✅ |

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.template .env

# Build the project
npm run build

# Run tests
npm test
```

### Code Quality

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Jest** for testing
- **Prettier** for code formatting (recommended)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request
