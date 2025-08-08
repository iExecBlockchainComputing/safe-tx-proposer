# Safe Multisig Transaction Proposer Action

A GitHub Action for proposing transactions through Safe multisig wallets with Foundry integration.

## Usage

```yaml
- name: Propose Safe Transaction
  uses: iExecBlockchainComputing/safe-tx-proposer@v1
  with:
    safe-address: ${{ secrets.SAFE_ADDRESS }}
    rpc-url: ${{ secrets.RPC_URL }}
    proposer-private-key: ${{ secrets.PROPOSER_PRIVATE_KEY }}
    safe-api-key: ${{ secrets.SAFE_API_KEY }}
    foundry-script-path: 'script/ProposalScript.s.sol'
    action-mode: 'propose'
    dry-run: false
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `safe-address` | Safe multisig wallet address | ✅ | |
| `rpc-url` | RPC URL for blockchain interaction | ✅ | |
| `proposer-private-key` | Private key of the proposer account | ✅ | |
| `safe-api-key` | API key for Safe API service | ✅ | |
| `foundry-script-path` | Path to the Foundry script to execute | ✅ | |
| `action-mode` | Action to perform: `propose` or `list-pending` | ❌ | `'propose'` |
| `dry-run` | Perform a dry run without actual execution | ❌ | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `transaction-hash` | Hash of the first proposed transaction |
| `transaction-hashes` | JSON array of all transaction hashes |
| `transaction-count` | Number of transactions processed |
| `pending-transactions` | JSON object containing pending transactions (list-pending mode) |
| `status` | Status of the operation (success, failed, pending) |

## Examples

### Propose Transaction
```yaml
name: Propose Safe Transaction
on:
  push:
    branches: [main]

jobs:
  propose:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Propose Transaction
        uses: iExecBlockchainComputing/safe-tx-proposer@v1
        with:
          safe-address: ${{ secrets.SAFE_ADDRESS }}
          rpc-url: ${{ secrets.RPC_URL }}
          proposer-private-key: ${{ secrets.PROPOSER_PRIVATE_KEY }}
          safe-api-key: ${{ secrets.SAFE_API_KEY }}
          foundry-script-path: 'script/MyScript.s.sol'
          action-mode: 'propose'
```

### List Pending Transactions
```yaml
- name: List Pending Transactions
  uses: iExecBlockchainComputing/safe-tx-proposer@v1
  with:
    safe-address: ${{ secrets.SAFE_ADDRESS }}
    rpc-url: ${{ secrets.RPC_URL }}
    proposer-private-key: ${{ secrets.PROPOSER_PRIVATE_KEY }}
    safe-api-key: ${{ secrets.SAFE_API_KEY }}
    foundry-script-path: 'script/EmptyScript.s.sol'
    action-mode: 'list-pending'
```

### Dry Run
```yaml
- name: Dry Run Transaction
  uses: iExecBlockchainComputing/safe-tx-proposer@v1
  with:
    safe-address: ${{ secrets.SAFE_ADDRESS }}
    rpc-url: ${{ secrets.RPC_URL }}
    proposer-private-key: ${{ secrets.PROPOSER_PRIVATE_KEY }}
    safe-api-key: ${{ secrets.SAFE_API_KEY }}
    foundry-script-path: 'script/TestScript.s.sol'
    dry-run: true
```

## Security Considerations

- Always store sensitive inputs like private keys and API keys as GitHub Secrets
- Use the minimum required permissions for the proposer account
- Test with dry-run mode first before proposing actual transactions
- Validate the Safe address and ensure it's the correct multisig wallet

## Development

To build this action locally:

```bash
npm install
npm run build:action
```

## License

MIT License - see LICENSE file for details.
