use alloy::{
    consensus::{SignableTransaction, TxEip1559, TxLegacy},
    primitives::{eip191_hash_message, utils::eip191_message, PrimitiveSignature},
};
use async_trait::async_trait;

use crate::{
    domain::{
        SignDataRequest, SignDataResponse, SignDataResponseEvm, SignTransactionResponse,
        SignTransactionResponseEvm, SignTypedDataRequest,
    },
    models::{
        Address, EvmTransactionDataSignature, EvmTransactionDataTrait, NetworkTransactionData,
        SignerError,
    },
    services::{AwsKmsClient, AwsKmsService, AwsKmsServiceTrait, DataSignerTrait, Signer},
};

pub type DefaultAwsKmsService = AwsKmsService<AwsKmsClient>;

pub struct AwsKmsSigner<T = DefaultAwsKmsService>
where
    T: AwsKmsServiceTrait,
{
    aws_kms_service: T,
}

impl AwsKmsSigner<DefaultAwsKmsService> {
    pub fn new(aws_kms_service: AwsKmsService) -> Self {
        Self { aws_kms_service }
    }
}

#[cfg(test)]
impl<T: AwsKmsServiceTrait> AwsKmsSigner<T> {
    pub fn new_for_testing(aws_kms_service: T) -> Self {
        Self { aws_kms_service }
    }
}

#[async_trait]
impl<T: AwsKmsServiceTrait> Signer for AwsKmsSigner<T> {
    async fn address(&self) -> Result<Address, SignerError> {
        let address = self.aws_kms_service.get_evm_address().await?;

        Ok(address)
    }

    async fn sign_transaction(
        &self,
        transaction: NetworkTransactionData,
    ) -> Result<SignTransactionResponse, SignerError> {
        let evm_data = transaction.get_evm_transaction_data()?;

        if evm_data.is_eip1559() {
            // Handle EIP-1559 transaction
            let unsigned_tx = TxEip1559::try_from(transaction)?;

            // Prepare transaction for signing
            let payload = unsigned_tx.encoded_for_signing();

            // Sign payload
            let signed_bytes = self.aws_kms_service.sign_payload_evm(&payload).await?;

            // Ensure we have the right signature length
            if signed_bytes.len() != 65 {
                return Err(SignerError::SigningError(format!(
                    "Invalid signature length from AWS KMS: expected 65 bytes, got {}",
                    signed_bytes.len()
                )));
            }

            // Construct primitive signature
            let signature = PrimitiveSignature::from_raw(&signed_bytes)
                .map_err(|e| SignerError::ConversionError(e.to_string()))?;

            // Extract signature array bytes
            let mut signature_bytes = signature.as_bytes();

            // Construct a signed transaction
            let signed_tx = unsigned_tx.into_signed(signature);

            // Adjust v value for EIP-1559 (27/28 -> 0/1)
            if signature_bytes[64] == 27 {
                signature_bytes[64] = 0;
            } else if signature_bytes[64] == 28 {
                signature_bytes[64] = 1;
            }

            // RLP encode the signed transaction
            let mut raw = Vec::with_capacity(signed_tx.eip2718_encoded_length());
            signed_tx.eip2718_encode(&mut raw);

            Ok(SignTransactionResponse::Evm(SignTransactionResponseEvm {
                hash: signed_tx.hash().to_string(),
                signature: EvmTransactionDataSignature::from(&signature_bytes),
                raw,
            }))
        } else {
            // Handle legacy transaction
            let unsigned_tx = TxLegacy::try_from(transaction)?;

            // Prepare transaction for signing
            let payload = unsigned_tx.encoded_for_signing();

            let signed_bytes = self.aws_kms_service.sign_payload_evm(&payload).await?;

            // Ensure we have the right signature length
            if signed_bytes.len() != 65 {
                return Err(SignerError::SigningError(format!(
                    "Invalid signature length from AWS KMS: expected 65 bytes, got {}",
                    signed_bytes.len()
                )));
            }

            let signature = PrimitiveSignature::from_raw(&signed_bytes)
                .map_err(|e| SignerError::ConversionError(e.to_string()))?;

            let signature_bytes = signature.as_bytes();

            let signed_tx = unsigned_tx.into_signed(signature);

            let mut raw = Vec::with_capacity(signed_tx.rlp_encoded_length());
            signed_tx.rlp_encode(&mut raw);

            Ok(SignTransactionResponse::Evm(SignTransactionResponseEvm {
                hash: signed_tx.hash().to_string(),
                signature: EvmTransactionDataSignature::from(&signature_bytes),
                raw,
            }))
        }
    }
}

#[async_trait]
impl<T: AwsKmsServiceTrait> DataSignerTrait for AwsKmsSigner<T> {
    async fn sign_data(&self, request: SignDataRequest) -> Result<SignDataResponse, SignerError> {
        let eip191_message = eip191_message(&request.message);

        let signature_bytes = self
            .aws_kms_service
            .sign_payload_evm(&eip191_message)
            .await?;

        // Ensure we have the right signature length
        if signature_bytes.len() != 65 {
            return Err(SignerError::SigningError(format!(
                "Invalid signature length from AWS KMS: expected 65 bytes, got {}",
                signature_bytes.len()
            )));
        }

        let r = hex::encode(&signature_bytes[0..32]);
        let s = hex::encode(&signature_bytes[32..64]);
        let v = signature_bytes[64];

        Ok(SignDataResponse::Evm(SignDataResponseEvm {
            r,
            s,
            v,
            sig: hex::encode(&signature_bytes),
        }))
    }

    async fn sign_typed_data(
        &self,
        _typed_data: SignTypedDataRequest,
    ) -> Result<SignDataResponse, SignerError> {
        // EIP-712 typed data signing requires specific handling
        // This is a placeholder that you'll need to implement based on your needs
        Err(SignerError::NotImplemented(
            "EIP-712 typed data signing not yet implemented for AWS KMS".into(),
        ))
    }
}
