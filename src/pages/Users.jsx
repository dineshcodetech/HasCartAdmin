import { useState } from 'react'
import { useUsers } from '../hooks'
import { formatDate } from '../utils/formatters'
import { USER_ROLES } from '../constants'
import UserCreation from '../components/UserCreation'
import Pagination from '../components/ui/Pagination'

function Users() {
  const { users, loading, error, pagination, filters, updateFilters, updatePagination, refetch } = useUsers()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleUserCreated = () => {
    refetch()
    setShowCreateForm(false)
  }

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value })
  }

  return (
    <div className="p-8 min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Users<span className="text-secondary">.</span></h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Platform User Base</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-secondary text-white hover:bg-green-700 rounded-full shadow-lg shadow-secondary/20 transition-all active:scale-95"
            >
              {showCreateForm ? 'Cancel' : 'Create User'}
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-sm text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-8 items-end flex-wrap">
        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Role</label>
          <select
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1 min-w-[150px] bg-transparent"
          >
            <option value="">All Roles</option>
            <option value={USER_ROLES.USER}>Users</option>
            <option value={USER_ROLES.AGENT}>Agents</option>
            <option value={USER_ROLES.ADMIN}>Admins</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Joined After</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Joined Before</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => updateFilters({ role: '', startDate: '', endDate: '' })}
          className="text-[10px] font-black uppercase text-gray-300 hover:text-primary transition-colors mb-1"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {showCreateForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <UserCreation onUserCreated={handleUserCreated} />
          </div>
        )}

        <div className="">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-primary">
              All Users ({pagination.total})
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-300">Searching Registry...</div>
          ) : users.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Network</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-primary">{u.name || 'N/A'}</p>
                            <p className="text-[9px] text-gray-400 uppercase">{u.referralCode || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-600 font-medium">{u.email}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{u.mobile}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${u.role === USER_ROLES.ADMIN ? 'bg-red-50 text-red-600' : u.role === USER_ROLES.AGENT ? 'bg-secondary/10 text-secondary' : 'bg-gray-50 text-gray-400'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.role !== 'user' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-primary">{u.referredUserCount || 0}</span>
                                <span className="text-[9px] text-gray-400 uppercase font-bold">Referrals</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-200">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-medium text-gray-500">{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={(page) => updatePagination({ page })}
                />
              </div>
            </>
          ) : (
            <div className="py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-300 text-sm italic">No users matching these filters were found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Users
