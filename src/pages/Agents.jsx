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
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'

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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-gray-900 text-3xl font-semibold mb-2">Agent Management</h1>
          <p className="text-gray-600 text-base m-0">Create and manage agents</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Button 
            variant="primary" 
            size="medium" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create New Agent'}
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
            <AgentCreation onAgentCreated={handleAgentCreated} />
          </div>
        )}
        
        <Card 
          title={`All Agents (${agents.length})`}
          className="overflow-hidden"
        >
          {loading ? (
            <LoadingSpinner 
              message="Loading agents..." 
              className="py-12"
            />
          ) : agents.length > 0 ? (
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
                    {currentAgents.map((agent, index) => (
                      <tr key={agent._id || index} className="transition-colors hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-4 text-gray-900 font-semibold">{agent.name || 'N/A'}</td>
                        <td className="px-4 py-4 text-blue-600">{agent.email || 'N/A'}</td>
                        <td className="px-4 py-4 text-gray-600 font-mono">{agent.mobile || 'N/A'}</td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-700">
                            {agent.role === USER_ROLES.AGENT ? 'Agent' : agent.role || 'Agent'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm">
                          {agent.createdAt ? formatDate(agent.createdAt) : 'N/A'}
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
                totalItems={agents.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                itemName="agents"
              />
            </>
          ) : (
            <p className="text-center py-12 px-8 text-gray-400 italic">No agents found</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Agents

