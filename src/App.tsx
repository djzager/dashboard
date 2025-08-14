import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
// import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import './App.css'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={
                    <Dashboard />
                } />
                <Route path="/reports" element={
                    <Reports />
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      {/* </GoogleOAuthProvider> */}
    </ThemeProvider>
  )
}

export default App