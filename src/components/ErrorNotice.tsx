import type { WalletError } from '../lib/walletErrors'

interface ErrorNoticeProps {
  error: WalletError
  onRetry: () => void
  onDismiss: () => void
}

export function ErrorNotice({
  error,
  onRetry,
  onDismiss
}: ErrorNoticeProps) {
  return (
    <div className="notice notice--error" role="alert">
      <p className="notice__message">{error.message}</p>
      <div className="notice__actions">
        {error.retryable && (
          <button
            type="button"
            className="icon-button"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
