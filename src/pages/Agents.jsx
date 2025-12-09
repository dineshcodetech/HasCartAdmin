/**
 * Agents Page Component
 * Displays agent management interface with creation form and paginated agents table
 */
import { useState, useMemo, useEffect } from 'react'
import { useAgents } from '../hooks'
import { formatDate } from '../utils/formatters'
import { USER_ROLES } from '../constants'
import { APP_CONFIG } from '../config'
import AgentCreation from '../components/AgentCreation'

function Agents() {
  const { agents, loading, error, refetch } = useAgents()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(APP_CONFIG.DEFAULT_PAGE_SIZE)

  const handleAgentCreated = () => {
    // Refresh the agents list after creating a new agent
    refetch()
    // Hide the form after successful creation
    setShowCreateForm(false)
  }

  // Calculate pagination
  const totalPages = Math.ceil(agents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAgents = useMemo(() => {
    return agents.slice(startIndex, endIndex)
  }, [agents, startIndex, endIndex])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when agents list changes and current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-light tracking-wide text-black mb-2">
              Agents.
            </h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Agent Management
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-black hover:bg-black hover:text-white transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Agent'}
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70 disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
          <p className="text-sm text-black">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {showCreateForm && (
          <div>
            <AgentCreation onAgentCreated={handleAgentCreated} />
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-light tracking-wide text-black mb-6">
            All Agents ({agents.length})
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-black text-sm tracking-wide">Loading...</div>
            </div>
          ) : agents.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Mobile</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Role</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAgents.map((agent, index) => (
                      <tr key={agent._id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-black font-medium">{agent.name || 'N/A'}</td>
                        <td className="px-4 py-4 text-black">{agent.email || 'N/A'}</td>
                        <td className="px-4 py-4 text-black font-mono text-sm">{agent.mobile || 'N/A'}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-black">
                            {agent.role === USER_ROLES.AGENT ? 'Agent' : agent.role || 'Agent'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-black text-sm">
                          {agent.createdAt ? formatDate(agent.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, agents.length)} of {agents.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-xs font-bold tracking-wide uppercase border border-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 text-xs font-bold tracking-wide uppercase border ${
                              currentPage === page
                                ? 'bg-black text-white border-black'
                                : 'border-black hover:bg-black hover:text-white'
                            } transition-colors`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-black">...</span>
                      }
                      return null
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-xs font-bold tracking-wide uppercase border border-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-12 text-gray-400 italic">No agents found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Agents

