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
    <div className="fixed left-0 top-0 h-full w-64 bg-primary flex flex-col shadow-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-lg">
            <img src="/logo.png" alt="HasCart Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold tracking-wide text-white">HASCART</h2>
        </div>
        {user && (
          <p className="text-[10px] text-gray-300 tracking-widest uppercase truncate opacity-80">{user.email}</p>
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
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${isActive
                    ? 'bg-white/10 text-secondary border-l-4 border-secondary font-bold pl-3'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
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

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border border-white/20 text-white hover:bg-white hover:text-primary transition-all rounded-lg mb-4"
        >
          Logout
        </button>
        <div className="text-center">
          <span className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase">v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

