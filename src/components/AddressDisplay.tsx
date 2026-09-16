import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { truncateAddress } from '../lib/format'

interface AddressDisplayProps {
  address: string
  explorerUrl: string | null
}

export function AddressDisplay({
  address,
  explorerUrl
}: AddressDisplayProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="address">
      <code className="address__value" title={address}>
        {truncateAddress(address)}
      </code>

      <div className="address__actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => void copy(address)}
          aria-label={copied ? 'Address copied' : 'Copy full address'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>

        {explorerUrl && (
          <a
            className="icon-button"
            href={explorerUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Explorer
          </a>
        )}
      </div>

      <span
        role="status"
        aria-live="polite"
        className="visually-hidden"
      >
        {copied ? 'Address copied to clipboard' : ''}
      </span>
    </div>
  )
}
