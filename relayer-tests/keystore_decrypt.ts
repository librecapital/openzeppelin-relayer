import fs from "fs";
import path from "path";
import { Wallet } from "ethers";

async function main() {
    // print current dir
    console.log("Current dir:", __dirname);
    // 1. Read the keystore JSON
    const keystorePath = path.join(__dirname, "../config/keys/local-signer.json");
    const json          = fs.readFileSync(keystorePath, "utf8");

    // 2. Your keystore password
    const password = process.env.KEYSTORE_PASSWORD;
    if (!password) {
        throw new Error("set KEYSTORE_PASSWORD in env");
    }

    // 3. Decrypt
    const wallet = await Wallet.fromEncryptedJson(json, password);

    // 4. Print the private key
    console.log("Private Key:", wallet.privateKey);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});