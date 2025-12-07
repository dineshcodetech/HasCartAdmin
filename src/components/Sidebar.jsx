/**
 * Sidebar Component
 * Main navigation sidebar for the admin panel
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, MENU_ITEMS } from '../constants'
import { APP_CONFIG } from '../config'
import Button from './ui/Button'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{APP_CONFIG.APP_NAME}</h2>
        {user && (
          <p className="text-sm text-gray-600">{user.email}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4" aria-label="Main navigation">
        <ul className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="secondary"
          size="medium"
          onClick={handleLogout}
          className="w-full"
          fullWidth
        >
          <span className="text-lg mr-2" aria-hidden="true">🚪</span>
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

