# Test Setup for Safe Transaction Proposer

This directory contains test files for the GitHub Action.

## Files

### `Test.s.sol`
A minimal Solidity script that serves as a test case for the action. This script doesn't require forge-std dependencies and can be used for testing the action's script parsing functionality.

### `../broadcast/Test.s.sol/1/run-1692000000.json`
A mock broadcast file that contains a sample transaction. This file is used when the action falls back to reading existing broadcast files instead of executing Foundry scripts.

## Test Strategy

The GitHub Actions test workflow uses the following approach:

1. **Mock Broadcast Files**: Instead of requiring a full Foundry setup with dependencies, we use pre-generated broadcast files to test the action's core functionality.

2. **Dry Run Mode**: All tests run in dry-run mode (`dry-run: true`) to avoid making actual blockchain transactions.

3. **Fallback Testing**: The action is designed to fall back to reading broadcast files when script execution fails, which is exactly what happens in our test environment.

## Mock Broadcast File Structure

The mock broadcast file contains:
- A single CALL transaction
- Minimal required fields for the action to process
- Chain ID 1 (Ethereum mainnet) for consistency with the test RPC

## Expected Behavior

When the test runs:
1. The action attempts to execute the Foundry script
2. Since Foundry isn't fully set up, the script execution fails
3. The action falls back to reading the mock broadcast file
4. The action processes the mock transaction in dry-run mode
5. The test completes successfully
