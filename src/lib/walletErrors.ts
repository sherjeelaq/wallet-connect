import type { ProviderRpcError } from '../types/ethereum'

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
export const ProviderErrorCode = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  // MetaMask-specific: an identical request is already open in the extension.
  REQUEST_ALREADY_PENDING: -32002
} as const

export interface WalletError {
  message: string
  retryable: boolean
}

function isProviderRpcError(
  cause: unknown
): cause is ProviderRpcError {
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    typeof (cause as { code: unknown }).code === 'number'
  )
}

export function toWalletError(cause: unknown): WalletError {
  if (isProviderRpcError(cause)) {
    switch (cause.code) {
      case ProviderErrorCode.USER_REJECTED:
        return {
          message:
            'You rejected the request. Approve it in your wallet to connect.',
          retryable: true
        }
      case ProviderErrorCode.REQUEST_ALREADY_PENDING:
        // Retrying is a no-op: the wallet ignores duplicates until this one is answered.
        return {
          message:
            'A connection request is already waiting. Open your wallet to finish it.',
          retryable: false
        }
      case ProviderErrorCode.UNAUTHORIZED:
        return {
          message:
            'Your wallet has not authorized this site yet. Connect to grant access.',
          retryable: true
        }
      case ProviderErrorCode.UNSUPPORTED_METHOD:
        return {
          message:
            "Your wallet doesn't support this request. Try MetaMask or another EVM wallet.",
          retryable: false
        }
      case ProviderErrorCode.DISCONNECTED:
      case ProviderErrorCode.CHAIN_DISCONNECTED:
        return {
          message:
            'Your wallet is not connected to a network. Check it and try again.',
          retryable: true
        }
    }
  }

  if (cause instanceof Error && cause.message) {
    return { message: cause.message, retryable: true }
  }

  return {
    message: 'Something went wrong while talking to your wallet.',
    retryable: true
  }
}
