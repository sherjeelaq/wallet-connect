import { WalletPanel } from './components/WalletPanel'
import { useWallet } from './hooks/useWallet'
import './App.css'

function App() {
  const { state, error, connect, disconnect, dismissError } =
    useWallet()

  return (
    <main className="app">
      <header className="app__header">
        <h1>Wallet Dashboard</h1>
        <p>Connect an EVM wallet to view your address and network.</p>
      </header>

      <WalletPanel
        state={state}
        error={error}
        onConnect={() => void connect()}
        onDisconnect={disconnect}
        onDismissError={dismissError}
      />
    </main>
  )
}

export default App
