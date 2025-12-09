/**
 * Sidebar Component
 * Minimalist design matching React Native pattern
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, MENU_ITEMS } from '../constants'
import { APP_CONFIG } from '../config'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-light tracking-wide text-black mb-2">HASCART</h2>
        {user && (
          <p className="text-xs text-gray-400 tracking-widest uppercase">{user.email}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors border-b ${
                    isActive
                      ? 'bg-black text-white border-black font-bold'
                      : 'text-black border-transparent hover:border-gray-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-sm uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border border-black hover:bg-black hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

