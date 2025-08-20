import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Layout } from './components/Layout'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { RPCProvider } from './contexts/RPCContext'
import { AlertProvider } from './contexts/AlertContext'

function App() {
  return (
    <ConnectionProvider>
      <RPCProvider>
        <AlertProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add more routes as needed */}
              </Routes>
            </Layout>
          </Router>
        </AlertProvider>
      </RPCProvider>
    </ConnectionProvider>
  )
}

export default App
