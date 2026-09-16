import type { WalletState } from '../hooks/useWallet'
import type { WalletError } from '../lib/walletErrors'
import { explorerAddressUrl, getChain } from '../lib/chains'
import { AddressDisplay } from './AddressDisplay'
import { ErrorNotice } from './ErrorNotice'
import { NetworkBadge } from './NetworkBadge'

interface WalletPanelProps {
  state: WalletState
  error: WalletError | null
  onConnect: () => void
  onDisconnect: () => void
  onDismissError: () => void
}

function assertNever(value: never): never {
  throw new Error(`Unhandled wallet state: ${JSON.stringify(value)}`)
}

export function WalletPanel({
  state,
  error,
  onConnect,
  onDisconnect,
  onDismissError
}: WalletPanelProps) {
  function renderBody() {
    switch (state.status) {
      case 'unsupported':
        return (
          <div className="panel__body">
            <p className="panel__lead">No EVM wallet detected</p>
            <p className="panel__hint">
              Install a browser wallet extension, then reload this
              page.
            </p>
            <a
              className="button button--primary"
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Install MetaMask
            </a>
          </div>
        )

      case 'disconnected':
      case 'connecting': {
        const isConnecting = state.status === 'connecting'
        return (
          <div className="panel__body">
            <p className="panel__lead">Not connected</p>
            <p className="panel__hint">
              {isConnecting
                ? 'Approve the request in your wallet to continue.'
                : 'This only shares your public address. Nothing is signed.'}
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting && (
                <span className="spinner" aria-hidden="true" />
              )}
              {isConnecting
                ? 'Waiting for wallet…'
                : 'Connect Wallet'}
            </button>
          </div>
        )
      }

      case 'connected': {
        const chain = getChain(state.chainId)
        return (
          <div className="panel__body">
            <dl className="details">
              <div className="details__row">
                <dt>Account</dt>
                <dd>
                  <AddressDisplay
                    address={state.address}
                    explorerUrl={explorerAddressUrl(
                      chain,
                      state.address
                    )}
                  />
                </dd>
              </div>
              <div className="details__row">
                <dt>Network</dt>
                <dd>
                  <NetworkBadge chain={chain} />
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className="button button--ghost"
              onClick={onDisconnect}
            >
              Disconnect
            </button>
            <p className="panel__hint">
              This clears the session here only. To revoke access,
              remove the site from your wallet's connected sites.
            </p>
          </div>
        )
      }

      default:
        return assertNever(state)
    }
  }

  return (
    <section className="panel">
      <header className="panel__header">
        <h2>Wallet</h2>
        <span
          className={`status-dot status-dot--${state.status}`}
          aria-label={`Status: ${state.status}`}
        />
      </header>

      {error && (
        <ErrorNotice
          error={error}
          onRetry={onConnect}
          onDismiss={onDismissError}
        />
      )}

      {renderBody()}
    </section>
  )
}
