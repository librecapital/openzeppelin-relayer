# How to test the Sei Testnet Relayer

## 1) Start Sei Testnet Relayer

In the workspace folder, run:

```shell
 docker compose -f relayer-sei-example/docker-compose.yaml --profile metrics up
```

## 2) Install relayer-tests dependencies

Make sure you have bun installed. then run inside the `relayer-tests` folder:

```shell
bun install
```

## 3) Run the tests

The account associated with the configured signer already hast some balance in
the testnet, so you can just run the tests with:

```shell
RELAYER_ID=sei-testnet API_KEY=8aa82468-3c3d-47db-aa05-7ef176d78417 bun test
```
