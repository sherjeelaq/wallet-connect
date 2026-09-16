import type { ChainInfo } from '../lib/chains'

interface NetworkBadgeProps {
  chain: ChainInfo
}

export function NetworkBadge({ chain }: NetworkBadgeProps) {
  return (
    <span className="badge" title={`Chain ID ${chain.id}`}>
      <span
        className="badge__dot"
        style={{ background: chain.color }}
        aria-hidden="true"
      />
      <span>{chain.name}</span>
      {chain.isTestnet && <span className="badge__tag">Testnet</span>}
    </span>
  )
}
