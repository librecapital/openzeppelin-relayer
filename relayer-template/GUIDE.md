## Creating a new relayer for an EVM chain

### 1) Clone the relayer repo

Clone the template relayer which contains the docker compose and configuration.

As of now this template lives inside the relayer fork, but in the future it should be a separate project that imports the relayer binary/docker image instead of building from source

```bash
git clone https://github.com/librecapital/openzeppelin-relayer && \
cd openzeppelin-relayer/template-relayer
```

### 2) Create the relayer configuration

To create the relayer configuration json. You can use `config/config.example.json` as a starting point:

```bash
cp config/config.example.json config/config.json
```

Refer to the [Configuration References](https://docs.openzeppelin.com/relayer#configuration_references) section for a complete list of configuration options.

We will modify it later on

### 3) Create a .env for the secrets:

Create a `.env` with correct values according to your needs from `.env.example` file as a starting point:

```bash
	cp .env.example .env
```

### 4) Create a signer

To create a new signer keystore, use the provided key generation tool:

```bash
cargo run --example create_key -- \
    --password DEFINE_YOUR_PASSWORD \
    --output-dir config/keys \
    --filename local-signer.json
```

Then update the `KEYSTORE_PASSPHRASE` field in your `.env` file with the password you used in the key creation example.

The tool supports the following options:

- `-password`: Required. Must contain at least:
  - 12 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- `-output-dir`: Directory for the keystore file (creates if not exists)
- `-filename`: Optional. Uses timestamp-based name if not provided
- `-force`: Optional. Allows overwriting existing files

Example with all options:

```
cargo run --example create_key -- \\
    --password "YourSecurePassword123!" \\
    --output-dir config/keys \\
    --filename local-signer.json \\
    --force

```

### 5) Configure Webhook URL

`/config/config.json` file is partially pre-configured. You need to specify the webhook URL that will receive updates from the relayer service.

For simplicity, visit [Webhook.site](https://webhook.site/), copy your unique URL, and then update the notifications[0].url field in `config/config.json` with this value.

### 6) Configure Webhook Signing Key

To sign webhook notification payloads, populate the `WEBHOOK_SIGNING_KEY` entry in the `.env` file.

For development purposes, you can generate the signing key using:

```bash
cargo run --example generate_uuid
```

> Note: Alternatively, you can use any online UUID generator.

Copy the generated UUID and update the `WEBHOOK_SIGNING_KEY` entry in the `.env` file.

### 7) Configure API Key

Generate an API key signing key for development purposes using:

```bash
cargo run --example generate_uuid
# or run this command to generate a UUID
# uuidgen

```

> Note: Alternatively, you can use any online UUID generator.

Copy the generated UUID and update the `API_KEY` entry in the `.env` file.

### 8) Configure the networks

Create a network json, for example for Sei:

```bash
touch config/networks/sei.json
```

In the file:

```json
{
  "networks": [
    {
      "average_blocktime_ms": 2000,
      "chain_id": 1328,
      "explorer_urls": [],
      "features": [],
      "is_testnet": true,
      "network": "sei-testnet",
      "required_confirmations": 1,
      "rpc_urls": ["https://evm-rpc-testnet.sei-apis.com"],
      "symbol": "SEI",
      "type": "evm"
    }
  ]
}
```

if you want to add a new network like Ethereum, you would create an `ethereum.json` file next to the sei one, with the exact same structure and fields, but change the values.

### 9) Update the relayer config with the new networks

For example for our sei config. the relayer config would end up looking like this:

```json
{
  "relayers": [
    {
      "id": "sei-testnet",
      "name": "Sei testnet",
      "network": "sei-testnet",
      "paused": false,
      "notification_id": "notification-example",
      "signer_id": "local-signer",
      "network_type": "evm",
      "policies": {
        "min_balance": 0
      }
    }
  ],
  "notifications": [
    {
      "id": "notification-example",
      "type": "webhook",
      "url": "https://webhook.site/11edb953-5220-4f94-9f22-4fdefd2ad619",
      "signing_key": {
        "type": "env",
        "value": "WEBHOOK_SIGNING_KEY"
      }
    }
  ],
  "signers": [
    {
      "id": "local-signer",
      "type": "local",
      "config": {
        "path": "config/keys/local-signer.json",
        "passphrase": {
          "type": "env",
          "value": "KEYSTORE_PASSPHRASE"
        }
      }
    }
  ],
  "networks": "/app/config/networks"
}
```

Note that we point to the networks folder, so any new networks added are automatically available to use in the “relayers” section.
