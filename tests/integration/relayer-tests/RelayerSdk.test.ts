import { RelayersApi } from '@openzeppelin/relayer-sdk/src/api.ts';
import { Configuration } from '@openzeppelin/relayer-sdk/src/configuration.ts';
import { type ApiResponseBalanceResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-balance-response.ts';
import { type ApiResponseBool } from '@openzeppelin/relayer-sdk/src/models/api-response-bool.ts';
import { type ApiResponseRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-relayer-response.ts';
import { type ApiResponseVecRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-relayer-response.ts';
import { type ApiResponseVecTransactionResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-transaction-response.ts';
import type { EvmTransactionRequest } from '@openzeppelin/relayer-sdk/src/models/evm-transaction-request.ts';
import type { RelayerUpdateRequest } from '@openzeppelin/relayer-sdk/src/models/relayer-update-request.ts';
import type { AxiosResponse } from 'axios';
import { describe, expect, test } from 'bun:test';
import { fail } from "node:assert/strict";

// Health and metrics are broken in the sdk, due to a misconfigured url. Should start with /api/v1/ and sdk does /v1/

const relayer_id = process.env.RELAYER_ID ?? fail("RELAYER_ID env var required");
const relayer_endpoint = process.env.RELAYER_ENDPOINT || 'http://localhost:8080';
const api_key = process.env.API_KEY ?? fail("RELAYER_ID env var required");

const config = new Configuration({
  basePath: relayer_endpoint,
  accessToken: api_key,
});
const relayersApi = new RelayersApi(config);

describe('RelayersApi Tests', () => {
  test('listRelayers returns a list of relayers', async () => {
    try {
      const { status, data } = await relayersApi
        .listRelayers() as AxiosResponse<ApiResponseVecRelayerResponse>;

      expect(status).toBe(200);
      expect(data.success).toBe(true);

      const relayers = data.data;
      expect(Array.isArray(relayers)).toBe(true);
      expect(relayers![0].id).toBe(relayer_id);
      console.log("listRelayers result: ", relayers);
    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }

  });

  test('getRelayer returns details of a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .getRelayer(relayer_id) as AxiosResponse<ApiResponseRelayerResponse>;

      expect(status).toBe(200);
      expect(data.success).toBe(true);

      const relayerData = data.data;
      expect(relayerData).toBeDefined();
      expect(relayerData!.id).toBe(relayer_id);
      console.log('getRelayer:', relayerData);
    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

  test('getRelayerBalance returns the balance of the configured relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .getRelayerBalance(relayer_id) as AxiosResponse<ApiResponseBalanceResponse>;

      expect(status).toBe(200);
      const relayerBalance = data.data;
      console.log('getRelayerBalance:', relayerBalance);
      expect(relayerBalance!.balance).toBeGreaterThan(0);

    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

  test('getRelayerStatus returns the status of a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .getRelayerStatus(relayer_id) as AxiosResponse;

      expect(status).toBe(200);
      const relayerStatus = data.data;
      expect(relayerStatus).toBeDefined();
      expect(relayerStatus!.paused).toBe(false);
      console.log('getRelayerStatus:', relayerStatus);
    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

  let transactionId: string;
  test('sendTransaction works', async () => {
    const tx_request: EvmTransactionRequest = {
      to: '0xc834dcdc9a074dbbadcc71584789ae4b463db116',
      value: 0,
      data: '0x',
      gas_limit: 21000,
      max_fee_per_gas: 1000000000,
      max_priority_fee_per_gas: 1000000000,
    };
    try {
      const { status, data } = await relayersApi
        .sendTransaction(relayer_id, tx_request) as AxiosResponse;

      expect(status).toBe(200);
      transactionId = data.data!.id; // Store the transaction ID for later use
      console.log('sendTransaction:', data);
    }
    catch (e) {

      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

  test('listTransactions returns a list of transactions for a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .listTransactions(relayer_id) as AxiosResponse<ApiResponseVecTransactionResponse>;

      expect(status).toBe(200);
      console.log('listTransactions:', data);
      const transactions = data.data!;
      expect(transactions.map(o => o.id)).toContain(transactionId);
    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

  test('updateRelayer can pause and unpause a relayer', async () => {
    try {
      // First, pause the relayer
      const pauseRequest: RelayerUpdateRequest = {
        paused: true
      };

      const { status: pauseStatus, data: pauseData } = await relayersApi
        .updateRelayer(relayer_id, pauseRequest) as AxiosResponse<ApiResponseRelayerResponse>;

      expect(pauseStatus).toBe(200);
      expect(pauseData.success).toBe(true);
      expect(pauseData.data!.paused).toBe(true);
      console.log('updateRelayer (pause):', pauseData);

      // Then, unpause the relayer
      const unpauseRequest: RelayerUpdateRequest = {
        paused: false
      };

      const { status: unpauseStatus, data: unpauseData } = await relayersApi
        .updateRelayer(relayer_id, unpauseRequest) as AxiosResponse<ApiResponseRelayerResponse>;

      expect(unpauseStatus).toBe(200);
      expect(unpauseData.success).toBe(true);
      expect(unpauseData.data!.paused).toBe(false);
      console.log('updateRelayer (unpause):', unpauseData);
    }
    catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
      throw e
    }
  });

});

