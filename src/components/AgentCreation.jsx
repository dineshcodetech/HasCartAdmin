/**
 * Agent Creation Component
 * Form for creating new agents with validation
 */
import { useState } from 'react'
import { agentService } from '../services/api'
import { USER_ROLES } from '../constants'
import { getErrorMessage } from '../utils/errorHandler'
import Input from './ui/Input'
import Button from './ui/Button'
import ErrorMessage from './ui/ErrorMessage'
import Card from './ui/Card'

function AgentCreation({ onAgentCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: USER_ROLES.AGENT,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear messages when user starts typing
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      mobile: '',
      role: USER_ROLES.AGENT,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await agentService.createAgent(formData)
      setSuccess(true)
      resetForm()
      
      // Notify parent component
      if (onAgentCreated) {
        onAgentCreated()
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to create agent'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Create New Agent" className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
            error={error && !formData.name ? 'Name is required' : ''}
          />

          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
            error={error && !formData.email ? 'Email is required' : ''}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            id="mobile"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            required
            placeholder="Enter mobile number"
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit mobile number"
            error={error && !formData.mobile ? 'Mobile number is required' : ''}
          />

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role
              <span className="text-red-600 ml-1">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md transition-all duration-200 font-inherit outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600 focus:ring-opacity-10 cursor-not-allowed bg-gray-100 opacity-70 pr-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
              disabled
            >
              <option value={USER_ROLES.AGENT}>Agent</option>
            </select>
          </div>
        </div>

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter password (minimum 6 characters)"
          minLength="6"
          error={error && !formData.password ? 'Password is required (min 6 characters)' : ''}
        />

        {error && (
          <ErrorMessage 
            message={error} 
            className="m-0"
          />
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 font-medium text-center">
            ✓ Agent created successfully!
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          disabled={loading}
          loading={loading}
          className="mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
          fullWidth
        >
          Create Agent
        </Button>
      </form>
    </Card>
  )
}

export default AgentCreation

