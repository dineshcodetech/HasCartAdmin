import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { formatCurrency, formatNumber } from '../utils/formatters'
import Pagination from '../components/ui/Pagination'

function Reports() {
    const [report, setReport] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
    })
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    })

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)
            queryParams.append('page', pagination.page)
            queryParams.append('limit', pagination.limit)

            const res = await apiCall(`/api/admin/reports/agent-clicks?${queryParams}`)
            if (res.ok) {
                setReport(res.data.data.report || [])
                setPagination(prev => ({
                    ...prev,
                    total: res.data.data.pagination.total,
                    totalPages: res.data.data.pagination.totalPages
                }))
            }
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.page, pagination.limit])

    useEffect(() => {
        fetchReport()
    }, [fetchReport])

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }))
    }

    return (
        <div className="p-8 min-h-screen bg-[#fafafa]">
            <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Performance Reports<span className="text-secondary">.</span></h1>
                <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Agent Wise Conversion Analytics</p>
            </div>

            {/* Date Filters */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-8 items-end flex-wrap">
                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Analysis From</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => {
                            setFilters(f => ({ ...f, startDate: e.target.value }))
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Analysis To</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => {
                            setFilters(f => ({ ...f, endDate: e.target.value }))
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setFilters({ startDate: '', endDate: '' })
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                        className="text-[10px] font-black uppercase text-gray-300 hover:text-primary transition-colors mb-1"
                    >
                        Reset
                    </button>
                    <button
                        onClick={fetchReport}
                        className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all mb-1"
                    >
                        Generate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-primary">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Performing Agent</p>
                    <p className="text-xl font-black text-primary truncate">
                        {report[0]?.agentName || '---'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-secondary">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Network Clicks</p>
                    <p className="text-xl font-black text-secondary">
                        {formatNumber(report.reduce((sum, item) => sum + item.totalClicks, 0))}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <h2 className="p-6 text-sm font-black uppercase tracking-[0.2em] text-primary border-b border-gray-50 flex justify-between items-center">
                    Agent Sales Performance
                    <span className="text-[10px] text-gray-300 font-bold">{pagination.total} Agents Tracked</span>
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/20">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Detail</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Clicks</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Unique Products</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales Volume</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Commission</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Yield</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="py-20 text-center animate-pulse text-[10px] font-black text-gray-300 uppercase tracking-widest">Analyzing Yield...</td></tr>
                            ) : report.length > 0 ? report.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-black text-primary">{item.agentName}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{item.referralCode}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-xs font-black text-primary">{formatNumber(item.totalClicks)}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black text-gray-500">{item.productCount}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-black text-gray-800">{formatCurrency(item.totalSalesVolume)}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-black text-secondary">{formatCurrency(item.estimatedEarnings)}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (item.totalClicks / 100) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-black text-primary">{(item.totalClicks / 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-300 italic text-sm">No data available for selected period</td></tr>
                            )}
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
        </div>
    )
}

export default Reports
