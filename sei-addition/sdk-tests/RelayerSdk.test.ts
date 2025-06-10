import { RelayersApi, HealthApi, MetricsApi } from '@openzeppelin/relayer-sdk/src/api.ts';
import { type ApiResponseVecRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-relayer-response.ts';
import { type ApiResponseRelayerResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-relayer-response.ts'
import { type ApiResponseBalanceResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-balance-response.ts';
import { type ApiResponseBool } from '@openzeppelin/relayer-sdk/src/models/api-response-bool.ts'
import { type ApiResponseVecTransactionResponse } from '@openzeppelin/relayer-sdk/src/models/api-response-vec-transaction-response.ts'
import { Configuration } from '@openzeppelin/relayer-sdk/src/configuration.ts';
import { test, expect, describe } from 'bun:test';
import type { AxiosResponse } from 'axios';

const config = new Configuration({
    basePath: 'http://localhost:8080',
    accessToken: 'a70d7a0e-6ea9-4176-9ff4-d5719d93af2c',
});

const relayersApi = new RelayersApi(config);
const healthApi = new HealthApi(config);
const metricsApi = new MetricsApi(config);
const relayer_id_anvil = 'anvil';
const relayer_id_sepolia = 'sepolia-example';

// describe('HealthApi Tests', () => {
//     test('health returns the health status of the API', async () => {
//         const { status, data } = await healthApi.health() as AxiosResponse<any>;
//         expect(status).toBe(200);
//         expect(data).toBeDefined();
//         console.log('health status:', data);
//     });
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

describe('RelayersApi Tests', () => {
    test('listRelayers returns a list of relayers', async () => {
        const { status, data } = await relayersApi
            .listRelayers() as AxiosResponse<ApiResponseVecRelayerResponse>;

        expect(status).toBe(200);
        expect(data.success).toBe(true);

        const relayers = data.data;
        expect(Array.isArray(relayers)).toBe(true);

        console.log("listRelayers", relayers);
    });

    test('getRelayer returns details of a specific relayer', async () => {
        const { status, data } = await relayersApi
            .getRelayer(relayer_id_anvil) as AxiosResponse<ApiResponseRelayerResponse>;

        expect(status).toBe(200);
        expect(data.success).toBe(true);

        const relayerData = data.data;
        expect(relayerData).toBeDefined();
        expect(relayerData!.id).toBe(relayer_id_anvil);
        console.log('getRelayer:', relayerData);
    });

    test('getRelayerBalance returns the balance of a specific relayer', async () => {
        const { status, data } = await relayersApi
            .getRelayerBalance(relayer_id_anvil) as AxiosResponse<ApiResponseBalanceResponse>;

        expect(status).toBe(200);
        const relayerBalance = data.data;
        expect(relayerBalance).toBeDefined();

        console.log('getRelayerBalance:', relayerBalance);
        expect(relayerBalance!.balance).toBeGreaterThan(0);
        expect(relayerBalance!.unit).toBe('wei');
    });

    test('getRelayerStatus returns the status of a specific relayer', async () => {
        const { status, data } = await relayersApi
            .getRelayerStatus(relayer_id_anvil) as AxiosResponse<ApiResponseBool>;

        expect(status).toBe(200);
        const relayerStatus = data.data;
        expect(relayerStatus).toBeDefined();
        console.log('getRelayerStatus:', relayerStatus);
    });

    test('listTransactions returns a list of transactions for a specific relayer', async () => {
        const { status, data } = await relayersApi
            .listTransactions(relayer_id_anvil) as AxiosResponse<ApiResponseVecTransactionResponse>;

        expect(status).toBe(200);
        console.log('listTransactions:', data);
    });
});



// Run the tests
console.log('Starting API tests...');