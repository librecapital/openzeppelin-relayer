import { Configuration, RelayersApi } from '@openzeppelin/relayer-sdk/dist/src';

const config = new Configuration({
    basePath: 'http://localhost:8080',
    accessToken: 'a70d7a0e-6ea9-4176-9ff4-d5719d93af2c',
});

const relayersApi = new RelayersApi(config);
const relayer_id_anvil = 'anvil'
const relayer_id_sepolia = 'sepolia-example'

// relayersApi
//     .listTransactions(relayer_id)
//     .then((transactions) => console.log(JSON.stringify(transactions.data, null, 2)))
//     .catch(console.error);

// get relayer info
relayersApi
    .getRelayer(relayer_id_anvil)
    .then((tokens) => console.log(JSON.stringify(tokens.data, null, 2)))
    .catch(console.error);
// get relayer balance
relayersApi
    .getRelayerBalance(relayer_id_anvil)
    .then((tokens) => console.log(JSON.stringify(tokens.data, null, 2)))
    .catch(console.error);

