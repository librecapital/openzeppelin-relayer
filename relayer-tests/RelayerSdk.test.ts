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

const config = new Configuration({
  basePath: 'http://localhost:8080',
  accessToken: 'a70d7a0e-6ea9-4176-9ff4-d5719d93af2c',
});

const relayersApi = new RelayersApi(config);

// Health and metrics are broken in the sdk, due to a misconfigured url. Should start with /api/v1/ and sdk does /v1/
// const healthApi = new HealthApi(config);
// const metricsApi = new MetricsApi(config);

const relayer_id_anvil = 'anvil';
const relayer_id_sepolia = 'sepolia-example';
const relayer_id_sei = 'sei-testnet';
const relayer_id = relayer_id_sei;
// describe('HealthApi Tests', () => {
//     test('health returns the health status of the API', async () => {
//         try {
//             const { status, data } = await healthApi.health() as AxiosResponse<string>;
//             expect(status).toBe(200);
//             expect(data).toBeDefined();
//             console.log('health status:', data);
//         }
//         catch (e) {
//             throw e.message
//         }
//
//     });
//
//     test("direct health api", async () => {
//         // do a GET on localhost:8080/v1/health with Bearer token authentication
//         try {
//             const response = await axios.get('http://localhost:8080/api/v1/health', {
//                 headers: {
//                     'Authorization': `Bearer ${config.accessToken}`
//                 }
//             });
//             const { status, data } = response;
//             expect(status).toBe(200);
//             expect(data).toBeDefined();
//             console.log('direct health status:', data);
//         } catch (e) {
//             throw e.message;
//         }
//     })
// });
//
// describe('MetricsApi Tests', () => {
//     test('listMetrics returns a list of metrics', async () => {
//         const { status, data } = await metricsApi.listMetrics() as AxiosResponse<any[]>;
//         expect(status).toBe(200);
//         expect(Array.isArray(data)).toBe(true);
//         console.log('listMetrics:', data);
//     });
//
// test('metricDetail returns details of a specific metric', async () => {
//     const metricName = 'process_cpu_seconds_total';
//     const { status, data } = await metricsApi.metricDetail(metricName) as AxiosResponse<string>;
//     expect(status).toBe(200);
//     expect(typeof data).toBe('string');
//     console.log('metricDetail:', data);
// });
//
// test('scrapeMetrics triggers an update of system metrics', async () => {
//     const { status, data } = await metricsApi.scrapeMetrics() as AxiosResponse<string>;
//     expect(status).toBe(200);
//     expect(typeof data).toBe('string');
//     console.log('scrapeMetrics:', data);
// });
// });
//
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
      e.message
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
      e.message
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
      e.message
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
      e.message
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
      e.message
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
      e.message
    }
  });

  test('rpc works', async () => {
    const rpc_request: JsonRpcRequestNetworkRpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      params: '',
      method: EvmRpcRequestOneOfMethodEnum.GENERIC_RPC_REQUEST
    };
    try {
      const { status, data } = await relayersApi
        .rpc(relayer_id, rpc_request) as AxiosResponse<JsonRpcResponseNetworkRpcResult>;

      expect(status).toBe(200);
      console.log('rpc response:', data);
    }
    catch (e) {
      e.message
    }
  });


});



// Run the tests
console.log('Starting API tests...');
