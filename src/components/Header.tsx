import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  onVisibilityChange?: (isVisible: boolean) => void
}

const Header: React.FC<HeaderProps> = ({ onVisibilityChange }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top of the screen
      if (e.clientY < 100) {
        setIsVisible(true)
        onVisibilityChange?.(true)
        // Clear any existing hide timeout
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          setHideTimeout(null)
        }
      } else if (e.clientY > 150) {
        // Set timeout to hide header when mouse moves away from top
        if (!hideTimeout) {
          const timeout = setTimeout(() => {
            setIsVisible(false)
            onVisibilityChange?.(false)
            setHideTimeout(null)
          }, 2000) // Hide after 2 seconds
          setHideTimeout(timeout)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [hideTimeout])

  return (
    <header className={`fixed top-0 left-0 right-0 bg-red-600 dark:bg-red-700 text-white p-4 flex justify-between items-center z-10 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <h1 className="text-2xl font-bold">Firehouse Dashboard</h1>
      
      <nav className="flex items-center space-x-6">
        <Link 
          to="/" 
          className={`px-4 py-2 rounded transition-colors ${
            isActive('/')
              ? 'bg-red-800 dark:bg-red-900' 
              : 'hover:bg-red-700 dark:hover:bg-red-800'
          }`}
        >
          Dashboard
        </Link>
        <Link 
          to="/reports" 
          className={`px-4 py-2 rounded transition-colors ${
            isActive('/reports')
              ? 'bg-red-800 dark:bg-red-900' 
              : 'hover:bg-red-700 dark:hover:bg-red-800'
          }`}
        >
          Reports
        </Link>
      </nav>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="flex items-center space-x-2">
          <img 
            src={user?.picture} 
            alt={user?.name} 
            className="w-8 h-8 rounded-full"
          />
          <span>{user?.name}</span>
          <button 
            onClick={logout}
            className="bg-red-700 dark:bg-red-800 hover:bg-red-800 dark:hover:bg-red-900 px-3 py-1 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header