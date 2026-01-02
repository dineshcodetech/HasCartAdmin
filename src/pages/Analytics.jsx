import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { AMAZON_SEARCH_INDEX } from '../constants'
import { useAgents } from '../hooks'
import { formatCurrency, formatDate } from '../utils/formatters'
import Pagination from '../components/ui/Pagination'
import CommissionModal from '../components/CommissionModal'

function Analytics() {
    const { agents } = useAgents()
    const [clicks, setClicks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedClick, setSelectedClick] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
    })
    const [filters, setFilters] = useState({
        category: '',
        agentId: '',
        status: '',
        startDate: '',
        endDate: ''
    })

    const fetchClicks = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (filters.category) queryParams.append('category', filters.category)
            if (filters.agentId) queryParams.append('agentId', filters.agentId)
            if (filters.status) queryParams.append('status', filters.status)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const response = await apiCall(`/api/admin/analytics/clicks?${queryParams}`)

            if (response.ok && response.data?.success) {
                setClicks(response.data.data.clicks || [])
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.pagination.total,
                    totalPages: response.data.data.pagination.totalPages
                }))
            } else {
                setError(response.data?.message || 'Failed to load click data')
            }
        } catch (err) {
            setError(err.message || 'Failed to load click data')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters])

    useEffect(() => {
        fetchClicks()
    }, [fetchClicks])

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            agentId: '',
            status: '',
            startDate: '',
            endDate: ''
        })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const handleTransactionAction = async (id, status) => {
        try {
            const res = await apiCall(`/api/admin/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                fetchClicks()
            } else {
                alert(res.data.message || 'Operation failed')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleRateUpdate = async (clickId, newRate) => {
        try {
            const rateValue = parseFloat(newRate);
            if (isNaN(rateValue)) return alert('Invalid rate');

            const res = await apiCall(`/api/admin/analytics/clicks/${clickId}`, {
                method: 'PUT',
                body: JSON.stringify({ commissionRate: rateValue })
            })

            if (res.ok) {
                fetchClicks();
            } else {
                alert(res.data?.message || 'Failed to update rate')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to update rate')
        }
    }

    return (
        <div className="p-8 min-h-screen bg-[#fafafa]">
            {/* Header */}
            <div className="mb-12">
                <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Analytics<span className="text-secondary">.</span></h1>
                        <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Real-time Product Click Stream</p>
                    </div>
                    <button
                        onClick={fetchClicks}
                        disabled={loading}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all disabled:opacity-40"
                    >
                        {loading ? 'Syncing...' : 'Refresh Stream'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-8 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="w-full text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary bg-transparent"
                    >
                        <option value="">All Categories</option>
                        {Object.values(AMAZON_SEARCH_INDEX).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Agent</label>
                    <select
                        value={filters.agentId}
                        onChange={(e) => updateFilter('agentId', e.target.value)}
                        className="w-full text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary bg-transparent"
                    >
                        <option value="">All Agents</option>
                        {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>{agent.name} ({agent.referralCode})</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="w-full text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary bg-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Under Review</option>
                        <option value="completed">Accepted</option>
                        <option value="failed">Rejected</option>
                        <option value="none">Ineligible</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">From</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => updateFilter('startDate', e.target.value)}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">To</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => updateFilter('endDate', e.target.value)}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
                    />
                </div>

                <button
                    onClick={clearFilters}
                    className="text-[10px] font-black uppercase text-gray-300 hover:text-primary transition-colors mb-1"
                >
                    Clear
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-primary">
                        Activity Feed ({pagination.total})
                    </h2>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-bold">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-300">Decrypting Stream...</div>
                ) : clicks.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product / ASIN</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rate</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Commission</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attributed Agent</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Action</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {clicks.map((click) => (
                                            <tr key={click._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <p className="text-xs font-black text-primary truncate max-w-[240px]" title={click.productName}>
                                                        {click.productName}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">ASIN: {click.asin}</p>
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-black text-gray-700">
                                                    {formatCurrency(click.price || 0)}
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-black text-gray-400">
                                                    {click.commissionRate ? `${(click.commissionRate * 100).toFixed(2)}%` : '—'}
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-black text-green-600">
                                                    {formatCurrency(click.commissionAmount || 0)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight bg-gray-50 px-2 py-1 rounded">
                                                        {click.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {click.user ? (
                                                        <div className="text-left">
                                                            <p className="text-xs font-bold text-primary">{click.user.name}</p>
                                                            <p className="text-[9px] text-gray-400 font-mono">{click.user.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-gray-300 uppercase italic">Guest Visitor</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {click.agent ? (
                                                        <div className="flex flex-col">
                                                            <p className="text-xs font-black text-secondary">{click.agent.name}</p>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] text-gray-400 font-black uppercase">Code:</span>
                                                                <span className="text-[9px] text-primary font-black uppercase select-all">{click.agent.referralCode}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {click.commissionStatus === 'pending' ? (
                                                        <div className="flex gap-1 items-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedClick(click);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="px-2 py-1 border border-gray-100 text-primary text-[8px] font-black uppercase rounded hover:bg-gray-50 transition-colors"
                                                                title="Edit Rate"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleTransactionAction(click.transactionId, 'completed')}
                                                                className="px-2 py-1 bg-primary text-white text-[8px] font-black uppercase rounded hover:bg-black transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleTransactionAction(click.transactionId, 'failed')}
                                                                className="px-2 py-1 border border-gray-100 text-gray-400 text-[8px] font-black uppercase rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${click.commissionStatus === 'completed' ? 'bg-green-50 text-green-600' :
                                                                click.commissionStatus === 'failed' ? 'bg-red-50 text-red-600' :
                                                                    'bg-gray-50 text-gray-400'
                                                                }`}>
                                                                {click.commissionStatus === 'none' ? 'Ineligible' : click.commissionStatus === 'completed' ? 'Accepted' : 'Rejected'}
                                                            </span>
                                                            {click.commissionStatus !== 'none' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedClick(click);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="text-gray-300 hover:text-primary transition-colors"
                                                                    title="Change Rate"
                                                                >
                                                                    <span className="text-[10px]">✎</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-xs font-bold text-gray-500">{formatDate(click.createdAt)}</p>
                                                    <p className="text-[9px] text-gray-300 font-bold">{new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-300 text-sm italic">No activity detected for the selected filters</p>
                    </div>
                )}
            </div>

            <CommissionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClick(null);
                }}
                onSave={(newRate) => {
                    handleRateUpdate(selectedClick._id, newRate);
                    setIsModalOpen(false);
                    setSelectedClick(null);
                }}
                currentRate={selectedClick?.commissionRate || 0}
                title="Edit Click Earnings"
                subtitle={selectedClick?.productName}
            />
        </div>
    )
}

export default Analytics
