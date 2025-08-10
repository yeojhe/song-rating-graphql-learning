import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import createRelayEnvironment from './RelayEnvironment.js'
import { RelayEnvironmentProvider } from 'react-relay'

const environment = createRelayEnvironment();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  </StrictMode>,
)
