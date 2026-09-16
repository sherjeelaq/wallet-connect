// Keyed by hex chain id, matching what eth_chainId returns.
export interface ChainInfo {
  id: string
  name: string
  currency: string | null
  explorer: string | null
  isTestnet: boolean
  color: string
}

const CHAINS: Record<string, Omit<ChainInfo, 'id'>> = {
  '0x1': {
    name: 'Ethereum',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    isTestnet: false,
    color: '#627eea'
  },
  '0xaa36a7': {
    name: 'Sepolia',
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
    color: '#627eea'
  },
  '0x89': {
    name: 'Polygon',
    currency: 'POL',
    explorer: 'https://polygonscan.com',
    isTestnet: false,
    color: '#8247e5'
  },
  '0x13882': {
    name: 'Polygon Amoy',
    currency: 'POL',
    explorer: 'https://amoy.polygonscan.com',
    isTestnet: true,
    color: '#8247e5'
  },
  '0xa': {
    name: 'OP Mainnet',
    currency: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    isTestnet: false,
    color: '#ff0420'
  },
  '0xa4b1': {
    name: 'Arbitrum One',
    currency: 'ETH',
    explorer: 'https://arbiscan.io',
    isTestnet: false,
    color: '#28a0f0'
  },
  '0x2105': {
    name: 'Base',
    currency: 'ETH',
    explorer: 'https://basescan.org',
    isTestnet: false,
    color: '#0052ff'
  },
  '0x14a34': {
    name: 'Base Sepolia',
    currency: 'ETH',
    explorer: 'https://sepolia.basescan.org',
    isTestnet: true,
    color: '#0052ff'
  },
  '0x38': {
    name: 'BNB Smart Chain',
    currency: 'BNB',
    explorer: 'https://bscscan.com',
    isTestnet: false,
    color: '#f0b90b'
  },
  '0xa86a': {
    name: 'Avalanche',
    currency: 'AVAX',
    explorer: 'https://snowtrace.io',
    isTestnet: false,
    color: '#e84142'
  }
}

// Unknown chains show their numeric id instead of a wrong name.
function unknownChain(chainId: string): ChainInfo {
  const decimal = Number.parseInt(chainId, 16)
  return {
    id: chainId,
    name: Number.isNaN(decimal)
      ? 'Unknown network'
      : `Chain ${decimal}`,
    currency: null,
    explorer: null,
    isTestnet: false,
    color: '#8b8b8b'
  }
}

export function getChain(chainId: string): ChainInfo {
  const key = chainId.toLowerCase()
  const known = CHAINS[key]
  return known ? { id: key, ...known } : unknownChain(key)
}

export function explorerAddressUrl(
  chain: ChainInfo,
  address: string
): string | null {
  return chain.explorer
    ? `${chain.explorer}/address/${address}`
    : null
}
