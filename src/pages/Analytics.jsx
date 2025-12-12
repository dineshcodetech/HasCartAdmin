/**
 * Analytics Page Component
 * Displays product click analytics with filters and pagination
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { AMAZON_SEARCH_INDEX } from '../constants'

function Analytics() {
    const [clicks, setClicks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        category: '',
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
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const response = await apiCall(`/api/admin/analytics/clicks?${queryParams}`)

            if (response.ok && response.data?.success) {
                setClicks(response.data.data.clicks || [])
                setPagination(prev => ({ ...prev, ...response.data.data.pagination }))
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

    const updatePage = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-light tracking-wide text-black mb-2">
                            Analytics.
                        </h1>
                        <p className="text-xs text-gray-400 tracking-widest uppercase">
                            Product Click Tracking
                        </p>
                    </div>
                    <button
                        onClick={fetchClicks}
                        disabled={loading}
                        className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70 disabled:opacity-40"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
                <h2 className="text-sm font-bold tracking-wider uppercase text-gray-500 mb-4">Filters</h2>
                <div className="flex gap-6 flex-wrap">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-black min-w-[180px]"
                        >
                            <option value="">All Categories</option>
                            {Object.values(AMAZON_SEARCH_INDEX).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => updateFilter('startDate', e.target.value)}
                            className="border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => updateFilter('endDate', e.target.value)}
                            className="border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-black"
                        />
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-sm text-black">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-light tracking-wide text-black mb-6">
                    Product Views ({pagination.total})
                </h2>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
                ) : clicks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">User</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Referred By (Agent)</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clicks.map((click) => (
                                    <tr key={click._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-sm truncate max-w-xs" title={click.productName}>
                                                {click.productName}
                                            </p>
                                            <p className="text-xs text-gray-400">ASIN: {click.asin}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm">{click.category}</td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium">{click.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{click.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {click.agent ? (
                                                <div className="bg-gray-100 px-2 py-1 inline-block">
                                                    <p className="text-xs font-bold">{click.agent.name}</p>
                                                    <p className="text-[10px] text-gray-500">Ref: {click.agent.referralCode}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right text-xs text-gray-500">
                                            {new Date(click.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updatePage(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-2 text-xs font-bold uppercase border border-gray-200 disabled:opacity-30 hover:border-black transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => updatePage(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 text-xs font-bold uppercase border border-gray-200 disabled:opacity-30 hover:border-black transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center py-12 text-gray-400 italic">No click data found for the selected filters.</p>
                )}
            </div>
        </div>
    )
}

export default Analytics
