Start Relayer:
```shell
docker compose -f sei-addition/docker-compose.yaml --profile metrics up
```

Start locally running ethereum chain:
```shell
anvil \
  --host 0.0.0.0 \
  --port 8545 \
  --chain-id 1337 \
  --block-time 2
```

Fund your relayer:
```shell
cast rpc anvil_setBalance \
  0x11c82a05291dd3e8a5aed5e0a62916be63988143 \
  0x2540BE400 \
  --rpc-url http://0.0.0.0:8545
```
Check balance of relayer:

