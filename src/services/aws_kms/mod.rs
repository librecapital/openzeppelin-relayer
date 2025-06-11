//! # AWS KMS Service Module
//!
//! This module provides integration with AWS KMS for secure key management
//! and cryptographic operations such as public key retrieval and message signing.
//!
//! Currently only EVM is supported.
//!
//! ## Features
//!
//! - Service account authentication using credential providers
//! - Public key retrieval from KMS
//! - Message signing via KMS
//!
//! ## Architecture
//!
//! ```text
//! AwsKmsService (implements AwsKmsServiceTrait)
//!   ├── Authentication (credential providers)
//!   ├── Public Key Retrieval
//!   └── Message Signing
//! ```

use alloy::primitives::{eip191_hash_message, keccak256};
use async_trait::async_trait;
use aws_config::{meta::region::RegionProviderChain, BehaviorVersion, Region};
use aws_sdk_kms::{
    primitives::Blob,
    types::{MessageType, SigningAlgorithmSpec},
    Client,
};
use k256::ecdsa::{RecoveryId, Signature, VerifyingKey};
use serde::Serialize;

use crate::{
    models::{Address, AwsKmsSignerConfig},
    utils::extract_public_key_from_der,
};

#[derive(Debug, thiserror::Error, Serialize)]
pub enum AwsKmsError {
    #[error("KMS response parse error: {0}")]
    ParseError(String),
    #[error("KMS config error: {0}")]
    ConfigError(String),
    #[error("KMS get error: {0}")]
    GetError(String),
    #[error("KMS signing error: {0}")]
    SignError(String),
    #[error("KMS permissions error: {0}")]
    PermissionError(String),
    #[error("KMS public key recovery error: {0}")]
    RecoveryError(String),
    #[error("Other error: {0}")]
    Other(String),
}

pub type AwsKmsResult<T> = Result<T, AwsKmsError>;

#[derive(Debug, Clone)]
pub enum PayloadType {
    Transaction,
    Message,
}

#[async_trait]
pub trait AwsKmsServiceTrait: Send + Sync {
    /// Returns the EVM address derived from the configured public key.
    async fn get_evm_address(&self) -> AwsKmsResult<Address>;
    /// Signs a payload using the EVM signing scheme.
    async fn sign_payload_evm(
        &self,
        payload: &[u8],
        payload_type: PayloadType,
    ) -> AwsKmsResult<Vec<u8>>;
}

#[derive(Debug, Clone)]
pub struct AwsKmsService {
    pub kms_key_id: String,
    client: Client,
}

impl AwsKmsService {
    pub async fn new(config: AwsKmsSignerConfig) -> AwsKmsResult<Self> {
        let region_provider =
            RegionProviderChain::first_try(config.region.map(Region::new)).or_default_provider();

        let auth_config = aws_config::defaults(BehaviorVersion::latest())
            .region(region_provider)
            .load()
            .await;
        let client = Client::new(&auth_config);

        Ok(Self {
            kms_key_id: config.key_id,
            client,
        })
    }

    /// Fetches the DER-encoded public key from AWS KMS.
    pub async fn get_der_pk(&self) -> AwsKmsResult<Vec<u8>> {
        let get_output = self
            .client
            .get_public_key()
            .key_id(&self.kms_key_id)
            .send()
            .await
            .map_err(|e| AwsKmsError::GetError(e.to_string()))?;

        let der_pk_blob = get_output
            .public_key
            .ok_or(AwsKmsError::GetError(
                "No public key blob found".to_string(),
            ))?
            .into_inner();

        Ok(der_pk_blob)
    }

    fn recover_public_key(pk: &[u8], sig: &Signature, bytes: &[u8]) -> AwsKmsResult<u8> {
        for v in 0..2 {
            let rec_id =
                RecoveryId::try_from(v).map_err(|e| AwsKmsError::RecoveryError(e.to_string()))?;

            let recovered_key = VerifyingKey::recover_from_msg(bytes, sig, rec_id)
                .map_err(|e| AwsKmsError::RecoveryError(e.to_string()))?
                .to_encoded_point(false)
                .as_bytes()
                .to_vec();

            if recovered_key == pk {
                return Ok(v);
            }
        }

        Err(AwsKmsError::RecoveryError(
            "No valid v point was found".to_string(),
        ))
    }

    /// Signs a bytes with the private key stored in AWS KMS.
    pub async fn sign_bytes_evm(
        &self,
        bytes: &[u8],
        payload_type: PayloadType,
    ) -> AwsKmsResult<Vec<u8>> {
        // Create a digest of a message payload
        let digest = match payload_type {
            // If the payload is a message, apply EIP-191 hash
            PayloadType::Message => eip191_hash_message(bytes).0,
            // Otherwise apply keccak256
            PayloadType::Transaction => keccak256(bytes).0,
        };

        // Sign the digest with the AWS KMS
        let sign_result = self
            .client
            .sign()
            .key_id(&self.kms_key_id)
            .signing_algorithm(SigningAlgorithmSpec::EcdsaSha256)
            .message_type(MessageType::Digest)
            .message(Blob::new(digest))
            .send()
            .await;

        // Process the result, extract DER signature
        let der_signature = sign_result
            .map_err(|e| AwsKmsError::PermissionError(e.to_string()))?
            .signature
            .ok_or(AwsKmsError::SignError(
                "Signature not found in response".to_string(),
            ))?
            .into_inner();

        // Parse DER into Secp256k1 format
        let rs = k256::ecdsa::Signature::from_der(&der_signature)
            .map_err(|e| AwsKmsError::ParseError(e.to_string()))?;

        let der_pk = self.get_der_pk().await?;

        // Extract public key from AWS KMS and convert it to an uncompressed 64 pk
        let pk = extract_public_key_from_der(&der_pk)
            .map_err(|e| AwsKmsError::ParseError(e.to_string()))?;

        // Extract v value from the public key recovery
        let v = Self::recover_public_key(&pk, &rs, bytes)?;

        // Append `v` to a signature bytes
        let mut sig_bytes = rs.to_vec();
        sig_bytes.push(v);

        Ok(sig_bytes)
    }
}

#[async_trait]
impl AwsKmsServiceTrait for AwsKmsService {
    async fn get_evm_address(&self) -> AwsKmsResult<Address> {
        self.get_evm_address().await
    }

    async fn sign_payload_evm(
        &self,
        message: &[u8],
        payload_type: PayloadType,
    ) -> AwsKmsResult<Vec<u8>> {
        self.sign_bytes_evm(message, payload_type).await
    }
}
