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
RELAYER_ID={your id} API_KEY={your key} HOST_PORT={http://localhost:8080} bun test
```

```

## Test Coverage
As of now, we test the following methods:

- `listRelayers`: shows all the relayers we have in the config. We should see our new chain here

- `getRelayer`: shows a specific relayer’s info. We should see the info of our new chain.
- `getRelayerBalance`: shows the native token balance of the relayer account. We should first fund it and check if we see the balance there.
- `sendTransaction`: we send an empty “ping”-style EIP-1559 transaction that sends 0 ETH to the address 0xc834…db116, consuming only the intrinsic 21 000 gas for a plain transfer.
- `getRelayerStatus`: shows status of relayer
- `updateRelayer`: pause and resume relayer
- `listTransactions`: shows the history of transactions and if they are pending, completed,

Missing tests, we can add as needed:

- `rpc`: NOT POSSIBLE for EVM as of now
- `getTransactionById`: get a transaction submitted to the relayer by id
- `getTransactionByNonce`: get a transaction submitted to the relayer by id
- `cancelTransaction`: cancel in-flight transaction
- `deletePendingTransactions`
- `replaceTransaction`
- `sign`: sign data with the relayer private key
- `signTypedData`: sign typed data with the relayer private key

## Prerequisites

Before running the tests, make sure:
1. The relayer service is running at the url defined by `HOST_PORT` (default is `http://localhost:8080`)
3. The relayer has been funded with some tokens
```
