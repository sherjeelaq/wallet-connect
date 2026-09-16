// Minimal EIP-1193 surface: https://eips.ethereum.org/EIPS/eip-1193

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface ProviderRpcError extends Error {
  code: number
  data?: unknown
}

export interface ProviderEventMap {
  accountsChanged: [accounts: string[]]
  chainChanged: [chainId: string]
  connect: [info: { chainId: string }]
  disconnect: [error: ProviderRpcError]
}

export interface Eip1193Provider {
  readonly isMetaMask?: boolean
  request<T>(args: RequestArguments): Promise<T>
  on<K extends keyof ProviderEventMap>(
    event: K,
    listener: (...args: ProviderEventMap[K]) => void
  ): void
  removeListener<K extends keyof ProviderEventMap>(
    event: K,
    listener: (...args: ProviderEventMap[K]) => void
  ): void
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

// Injected by the wallet extension, so it may not exist.
export function getProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}
