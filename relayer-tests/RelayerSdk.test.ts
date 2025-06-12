import { RelayersApi, HealthApi, MetricsApi } from '@openzeppelin/relayer-sdk/src/api.ts';
import { type ApiResponseVecRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-relayer-response.ts';
import { type ApiResponseRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-relayer-response.ts'
import { type ApiResponseBalanceResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-balance-response.ts';
import { type ApiResponseBool } from '@openzeppelin/relayer-sdk/src/models/api-response-bool.ts'
import { type ApiResponseVecTransactionResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-transaction-response.ts'
import type { EvmTransactionRequest } from '@openzeppelin/relayer-sdk/src/models/evm-transaction-request.ts';
import { Configuration } from '@openzeppelin/relayer-sdk/src/configuration.ts';
import { test, expect, describe } from 'bun:test';
import type { AxiosResponse } from 'axios';
import { EvmRpcRequestOneOfMethodEnum, type EvmRpcRequest, type JsonRpcRequestNetworkRpcRequest, type JsonRpcResponseNetworkRpcResult } from '@openzeppelin/relayer-sdk/src/models';
import { fail } from "node:assert/strict";

// Health and metrics are broken in the sdk, due to a misconfigured url. Should start with /api/v1/ and sdk does /v1/

const relayer_id = process.env.RELAYER_ID ?? fail("RELAYER_ID env var required");
const relayer_endpoint = process.env.HOST_PORT || 'http://localhost:8080';
const api_key = process.env.API_KEY ?? fail("RELAYER_ID env var required");

// RELAYER_ID=sei-testnet,API_KEY=8aa82468-3c3d-47db-aa05-7ef176d78417 bun test

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

      console.log("listRelayers", relayers);
    }
    catch (e) {
      throw e.message
    }

  });

  test('getRelayer returns details of a specific relayer', async () => {
    console.log('getRelayer', relayer_id!);
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
      throw e.message
    }
  });

  test('getRelayerBalance returns the balance of a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .getRelayerBalance(relayer_id) as AxiosResponse<ApiResponseBalanceResponse>;

      expect(status).toBe(200);
      const relayerBalance = data.data;
      expect(relayerBalance).toBeDefined();

      console.log('getRelayerBalance:', relayerBalance);
    }
    catch (e) {
      throw e.message
    }

  });

  test('getRelayerStatus returns the status of a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .getRelayerStatus(relayer_id) as AxiosResponse<ApiResponseBool>;

      expect(status).toBe(200);
      const relayerStatus = data.data;
      expect(relayerStatus).toBeDefined();
      console.log('getRelayerStatus:', relayerStatus);
    }
    catch (e) {
      throw e.message
    }
  });

  test('listTransactions returns a list of transactions for a specific relayer', async () => {
    try {
      const { status, data } = await relayersApi
        .listTransactions(relayer_id) as AxiosResponse<ApiResponseVecTransactionResponse>;

      expect(status).toBe(200);
      console.log('listTransactions:', data);
    }
    catch (e) {
      throw e.message
    }
  });

  test('sendTransaction works', async () => {
    const tx_request: EvmTransactionRequest = {
      gas_limit: 100000,
      value: 10000,
      to: '0xbeef'
    };
    try {
      const { status, data } = await relayersApi
        .sendTransaction(relayer_id, tx_request) as AxiosResponse<ApiResponseVecTransactionResponse>;

      expect(status).toBe(200);
      console.log('sendTransaction:', data);
    }
    catch (e) {
      throw e.message
    }
  });
});



// Run the tests
console.log('Starting API tests...');
