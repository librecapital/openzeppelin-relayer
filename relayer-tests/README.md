# sdk-tests

This project contains tests for the OpenZeppelin Relayer SDK.

## Setup

To install dependencies:

```bash
bun install
```

## Running the Tests

To run the tests:

```bash
bun test
```

This will execute all the tests in the index.ts file using Bun's built-in test runner.

Alternatively, you can run the file directly:

```bash
bun run index.ts
```

## Test Coverage

The tests cover all functions from the OpenZeppelin Relayer SDK specification:

1. RelayersApi:
   - listRelayers
   - getRelayer
   - getRelayerBalance
   - getRelayerStatus
   - listTransactions
   - sendTransaction
   - getTransactionById
   - getTransactionByNonce
   - replaceTransaction
   - cancelTransaction
   - deletePendingTransactions
   - sign
   - signTypedData
   - rpc
   - updateRelayer

2. HealthApi:
   - health

3. MetricsApi:
   - listMetrics
   - metricDetail
   - scrapeMetrics

## Prerequisites

Before running the tests, make sure:
1. The relayer service is running (see GUIDE.md)
2. A local Ethereum chain is running (if testing with Anvil)
3. The relayer has been funded (if testing transaction-related functions)

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
