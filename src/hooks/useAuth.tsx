import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CredentialResponse } from '@react-oauth/google'
import Cookies from 'js-cookie'

interface User {
  email: string
  name: string
  picture: string
}

interface AuthContextType {
  user: User | null
  login: () => void
  logout: () => void
  loading: boolean
  handleCredentialResponse: (credentialResponse: CredentialResponse) => void
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

  useEffect(() => {
    const savedUser = Cookies.get('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleCredentialResponse = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    
    try {
      const userObject = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
      
      if (!userObject.email.endsWith('@reva16.org')) {
        alert('Access restricted to reva16.org domain only')
        return
      }

      const userData: User = {
        email: userObject.email,
        name: userObject.name,
        picture: userObject.picture
      }
      
      setUser(userData)
      Cookies.set('user', JSON.stringify(userData), { expires: 7 })
    } catch (error) {
      console.error('Error parsing credential:', error)
    }
  }

  const login = () => {
    // Login is now handled by GoogleLogin component
    console.log('Login triggered')
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('user')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    handleCredentialResponse
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}