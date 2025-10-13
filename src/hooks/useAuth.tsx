import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  email: string
  name: string
  fdToken: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = Cookies.get('user')

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Error parsing saved user:', err)
        Cookies.remove('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      // Get proxy URL
      const proxyUrl = import.meta.env.PROD && window.location.hostname !== 'localhost'
        ? window.location.origin
        : import.meta.env.VITE_PROXY_URL || 'http://localhost:3001'

      // Call auth endpoint through proxy to avoid CORS
      const response = await fetch(`${proxyUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          grant_type: 'client_credentials',
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Invalid credentials')
      }

      const data = await response.json()

      if (!data.access_token) {
        throw new Error('No access token received from First Due')
      }

      // Create user object
      const userData: User = {
        email,
        name: email.split('@')[0], // Use email prefix as name
        fdToken: data.access_token
      }

      setUser(userData)
      Cookies.set('user', JSON.stringify(userData), { expires: 7 }) // 7 days
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    Cookies.remove('user')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
