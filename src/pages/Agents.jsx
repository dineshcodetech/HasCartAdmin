import { useState, useCallback, useEffect } from 'react'
import { useUsers } from '../hooks'
import { formatDate } from '../utils/formatters'
import { USER_ROLES } from '../constants'
import AgentCreation from '../components/AgentCreation'
import Pagination from '../components/ui/Pagination'
import { apiCall } from '../services/api'

function Agents() {
  // Use useUsers hook with role='agent' fixed
  const { users: agents, loading, error, pagination, filters, updateFilters, updatePagination, refetch } = useUsers({ role: 'agent' })
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Referral Modal States
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [loadingReferrals, setLoadingReferrals] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)

  const handleAgentCreated = () => {
    refetch()
    setShowCreateForm(false)
  }

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value })
  }

  const viewReferrals = async (agent) => {
    setSelectedAgent(agent)
    setShowReferralModal(true)
    setLoadingReferrals(true)
    try {
      const response = await apiCall(`/api/admin/agents/${agent._id}/referrals`)
      if (response.ok) {
        setReferrals(response.data.data || response.data || [])
      }
    } catch (err) {
      console.error('Error fetching referrals:', err)
    } finally {
      setLoadingReferrals(false)
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Agents<span className="text-secondary">.</span></h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Network Partners & Affiliates</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-secondary text-white hover:bg-green-700 rounded-full shadow-lg shadow-secondary/20 transition-all active:scale-95"
            >
              {showCreateForm ? 'Cancel' : 'Create Agent'}
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
          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Joined After</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Joined Before</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
          />
        </div>

        <button
          onClick={() => updateFilters({ startDate: '', endDate: '' })}
          className="text-[10px] font-black uppercase text-gray-300 hover:text-primary transition-colors mb-1"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {showCreateForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <AgentCreation onAgentCreated={handleAgentCreated} />
          </div>
        )}

        <div className="">
          <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
            All Agents ({pagination.total})
          </h2>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-300">Synchronizing Network...</div>
          ) : agents.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Referrals</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {agents.map((agent) => (
                        <tr key={agent._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-primary">{agent.name || 'N/A'}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-black">{agent.referralCode || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 font-medium">{agent.email}</td>
                          <td className="px-6 py-4 text-[10px] text-gray-400 font-mono">{agent.mobile}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => viewReferrals(agent)}
                                className="group flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-secondary/10 border border-gray-100 hover:border-secondary/30 rounded-full transition-all"
                              >
                                <span className="text-sm font-black text-primary group-hover:text-secondary">
                                  {agent.referredUserCount || 0}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 group-hover:text-secondary uppercase tracking-tight">View</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">
                            {agent.createdAt ? formatDate(agent.createdAt) : 'N/A'}
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
              <p className="text-gray-300 text-sm italic">No agents found for the selected dates</p>
            </div>
          )}
        </div>
      </div>

      {/* Referral List Modal - Cleaned up */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
              <div>
                <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                  <span className="text-secondary">{selectedAgent?.name}'s</span> Network
                </h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">
                  Referral Code: {selectedAgent?.referralCode}
                </p>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-primary font-black"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {loadingReferrals ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-[3px] border-gray-100 border-t-secondary rounded-full animate-spin mb-4"></div>
                  <p className="text-[10px] text-gray-300 font-black tracking-widest uppercase">Mapping Network...</p>
                </div>
              ) : referrals.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Email</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Mobile</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {referrals.map((refUser) => (
                        <tr key={refUser._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-primary">{refUser.name}</td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-medium">{refUser.email}</td>
                          <td className="px-6 py-4 text-[11px] text-gray-400 font-mono">{refUser.mobile || '—'}</td>
                          <td className="px-6 py-4 text-[10px] text-gray-400 font-bold">{formatDate(refUser.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <span className="text-3xl mb-4 grayscale opacity-50">👥</span>
                  <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">This agent has no users in their network yet.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-[#fafafa] flex justify-end">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-8 py-3 bg-primary text-white text-[10px] font-black tracking-widest uppercase rounded-full hover:bg-black transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agents
