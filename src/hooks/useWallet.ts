import { useCallback, useEffect, useState } from 'react'
import { getProvider } from '../types/ethereum'
import { toWalletError, type WalletError } from '../lib/walletErrors'

export type WalletState =
  | { status: 'unsupported' }
  | { status: 'disconnected' }
  | { status: 'connecting' }
  | { status: 'connected'; address: string; chainId: string }

export interface UseWalletResult {
  state: WalletState
  error: WalletError | null
  connect: () => Promise<void>
  disconnect: () => void
  dismissError: () => void
}

export function useWallet(): UseWalletResult {
  const [state, setState] = useState<WalletState>(() =>
    getProvider()
      ? { status: 'disconnected' }
      : { status: 'unsupported' }
  )
  const [error, setError] = useState<WalletError | null>(null)

  const hasProvider = state.status !== 'unsupported'

  // Some wallets inject window.ethereum after the first paint.
  useEffect(() => {
    if (hasProvider) return

    const settle = () => {
      if (getProvider()) setState({ status: 'disconnected' })
    }

    window.addEventListener('ethereum#initialized', settle, {
      once: true
    })
    const timer = window.setTimeout(settle, 3000)

    return () => {
      window.removeEventListener('ethereum#initialized', settle)
      window.clearTimeout(timer)
    }
  }, [hasProvider])

  // eth_accounts never prompts, so a refresh restores the session silently.
  useEffect(() => {
    if (!hasProvider) return
    const provider = getProvider()
    if (!provider) return

    let cancelled = false

    void (async () => {
      try {
        const accounts = await provider.request<string[]>({
          method: 'eth_accounts'
        })
        const address = accounts[0]
        if (cancelled || !address) return

        const chainId = await provider.request<string>({
          method: 'eth_chainId'
        })
        if (cancelled) return

        setState({ status: 'connected', address, chainId })
      } catch (e) {
        console.warn('Wallet session restore failed', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hasProvider])

  useEffect(() => {
    if (!hasProvider) return
    const provider = getProvider()
    if (!provider) return

    const handleAccountsChanged = (accounts: string[]) => {
      const address = accounts[0]

      // An empty array means the user revoked this site from the wallet UI.
      if (!address) {
        setState({ status: 'disconnected' })
        return
      }

      // Also fires when the user connects from the extension, so resolve the chain.
      void provider
        .request<string>({ method: 'eth_chainId' })
        .then(chainId =>
          setState({ status: 'connected', address, chainId })
        )
        .catch((cause: unknown) => setError(toWalletError(cause)))
    }

    const handleChainChanged = (chainId: string) => {
      setState(prev =>
        prev.status === 'connected' ? { ...prev, chainId } : prev
      )
    }

    const handleDisconnect = () => {
      setState({ status: 'disconnected' })
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    provider.on('disconnect', handleDisconnect)

    return () => {
      provider.removeListener(
        'accountsChanged',
        handleAccountsChanged
      )
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('disconnect', handleDisconnect)
    }
  }, [hasProvider])

  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setState({ status: 'unsupported' })
      return
    }

    setError(null)
    setState({ status: 'connecting' })

    try {
      // This opens the wallet popup. Everything before it is silent.
      const accounts = await provider.request<string[]>({
        method: 'eth_requestAccounts'
      })
      const address = accounts[0]

      if (!address) {
        setState({ status: 'disconnected' })
        setError({
          message: 'Your wallet returned no accounts.',
          retryable: true
        })
        return
      }

      const chainId = await provider.request<string>({
        method: 'eth_chainId'
      })
      setState({ status: 'connected', address, chainId })
    } catch (cause) {
      setState({ status: 'disconnected' })
      setError(toWalletError(cause))
    }
  }, [])

  // EIP-1193 has no disconnect method, so a dapp can only forget the session.
  const disconnect = useCallback(() => {
    setState({ status: 'disconnected' })
    setError(null)
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return { state, error, connect, disconnect, dismissError }
}
