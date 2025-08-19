import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import createRelayEnvironment from './RelayEnvironment'
import { RelayEnvironmentProvider } from 'react-relay'
import React from 'react'

const environment = createRelayEnvironment();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  </React.StrictMode>
)
