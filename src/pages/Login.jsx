/**
 * Login Page Component
 * Matches React Native minimalist design pattern
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { apiCall } from '../services/api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please check your email address.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok && response.data) {
        const data = response.data
        const token = data.token || data.data?.token
        const admin = data.admin || data.user || data.data?.admin || data.data?.user || data.data

        if (token) {
          await login(formData.email, formData.password)
          navigate(ROUTES.DASHBOARD)
        } else {
          setError(data.message || 'Authentication failed.')
        }
      } else {
        setError(response.data?.message || 'Authentication failed.')
      }
    } catch (error) {
      setError(`Connection error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8">
      <div className="w-full max-w-md">
        {/* Brand Logo Area */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="HasCart Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-[0.2em] text-primary mb-2">
            HASCART
          </h1>
          <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">
            Admin Entry
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoCapitalize="none"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-gray-400 text-[10px] tracking-widest font-bold uppercase hover:text-secondary transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-primary py-5 mt-8 text-white text-sm font-bold tracking-[0.15em] uppercase hover:opacity-90 shadow-xl shadow-primary/20 active:transform active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block animate-spin text-lg">⏳</span>
            ) : (
              'Enter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

