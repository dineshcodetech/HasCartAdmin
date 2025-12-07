/**
 * Users Page Component
 * Displays user management interface with creation form and paginated users table
 */
import { useState, useMemo, useEffect } from 'react'
import { useUsers } from '../hooks'
import { formatDate } from '../utils/formatters'
import { USER_ROLES } from '../constants'
import { APP_CONFIG } from '../config'
import UserCreation from '../components/UserCreation'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'

function Users() {
  const { users, loading, error, refetch } = useUsers()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(APP_CONFIG.DEFAULT_PAGE_SIZE)
  const [roleFilter, setRoleFilter] = useState('')

  const handleUserCreated = () => {
    // Refresh the users list after creating a new user
    refetch()
    // Hide the form after successful creation
    setShowCreateForm(false)
  }

  // Filter users by role
  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users
    return users.filter(user => user.role === roleFilter)
  }, [users, roleFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, startIndex, endIndex])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when users list changes and current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [roleFilter])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-gray-900 text-3xl font-semibold mb-2">User Management</h1>
          <p className="text-gray-600 text-base m-0">Create and manage users</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="m-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 text-sm border-2 border-gray-200 rounded-lg transition-all duration-200 bg-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500 focus:ring-opacity-10 min-w-[150px] pr-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
            >
              <option value="">All Roles</option>
              <option value={USER_ROLES.USER}>Users</option>
              <option value={USER_ROLES.AGENT}>Agents</option>
              <option value={USER_ROLES.ADMIN}>Admins</option>
            </select>
          </div>
          <Button 
            variant="primary" 
            size="medium" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create New User'}
          </Button>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={refetch}
            disabled={loading}
            loading={loading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => {}} 
          className="mb-6"
        />
      )}

      <div className="flex flex-col gap-8">
        {showCreateForm && (
          <div className="animate-slideDown">
            <UserCreation onUserCreated={handleUserCreated} />
          </div>
        )}
        
        <Card 
          title={`All Users (${filteredUsers.length}${roleFilter ? ` - Filtered by ${roleFilter}` : ''})`}
          className="overflow-hidden"
        >
          {loading ? (
            <LoadingSpinner 
              message="Loading users..." 
              className="py-12"
            />
          ) : filteredUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto -m-6 p-6">
                <table className="w-full border-collapse bg-white">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Email</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Mobile</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Role</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user._id || index} className="transition-colors hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-4 text-gray-900 font-semibold">{user.name || 'N/A'}</td>
                        <td className="px-4 py-4 text-blue-600">{user.email || 'N/A'}</td>
                        <td className="px-4 py-4 text-gray-600 font-mono">{user.mobile || 'N/A'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            user.role === USER_ROLES.ADMIN 
                              ? 'bg-orange-100 text-orange-700' 
                              : user.role === USER_ROLES.AGENT
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === USER_ROLES.ADMIN ? 'Admin' : user.role === USER_ROLES.AGENT ? 'Agent' : 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                itemName="users"
              />
            </>
          ) : (
            <p className="text-center py-12 px-8 text-gray-400 italic">No users found</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Users
