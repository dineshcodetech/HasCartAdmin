/**
 * Main App Component
 * Sets up routing, authentication, and application structure
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ROUTES } from './constants'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Agents from './pages/Agents'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

/**
 * AppRoutes Component
 * Handles routing logic based on authentication state
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-gray-50">
        <LoadingSpinner
          size="large"
          message="Initializing application..."
        />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path={ROUTES.ROOT}
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="agents" element={<Agents />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

/**
 * Root App Component
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
