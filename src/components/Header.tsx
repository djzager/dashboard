import { useAuth } from '../hooks/useAuth'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-red-600 dark:bg-red-700 text-white p-4 flex justify-between items-center">
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