import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CredentialResponse, useGoogleLogin } from '@react-oauth/google'
import Cookies from 'js-cookie'

interface User {
  email: string
  name: string
  picture: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: () => void
  logout: () => void
  loading: boolean
  handleCredentialResponse: (credentialResponse: CredentialResponse) => void
  requestCalendarAccess: () => void
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
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log('Calendar OAuth success:', response)
      setAccessToken(response.access_token)
      Cookies.set('accessToken', response.access_token, { expires: 1 }) // Store for 1 day
    },
    onError: (error) => {
      console.error('Google OAuth login error:', error)
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  })

  useEffect(() => {
    const savedUser = Cookies.get('user')
    const savedToken = Cookies.get('accessToken')
    
    console.log('Auth loading - savedUser:', !!savedUser, 'savedToken:', !!savedToken)
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedToken) {
      setAccessToken(savedToken)
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
      
      // After successful login, also try to get calendar permissions
      console.log('User logged in, requesting calendar permissions...')
      // Use setTimeout to ensure this happens after the login flow completes
      setTimeout(() => {
        googleLogin()
      }, 100)
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
    setAccessToken(null)
    Cookies.remove('user')
    Cookies.remove('accessToken')
  }

  const requestCalendarAccess = () => {
    console.log('Manually requesting calendar access...')
    googleLogin()
  }

  const value: AuthContextType = {
    user,
    accessToken,
    login,
    logout,
    loading,
    handleCredentialResponse,
    requestCalendarAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}