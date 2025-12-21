import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'
import { useAgents } from '../hooks'

function Commissions() {
    const { agents } = useAgents()
    const [transactions, setTransactions] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [productClicks, setProductClicks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('transactions')
    const [txPagination, setTxPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 })
    const [wdPagination, setWdPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 })
    const [clicksPagination, setClicksPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 })
    const [page, setPage] = useState(1)
    const [allClicks, setAllClicks] = useState([]) // Store all clicks for client-side pagination
    const [allWithdrawals, setAllWithdrawals] = useState([]) // Store all withdrawals for client-side pagination
    const [filters, setFilters] = useState({
        userId: '',
        status: '',
        startDate: '',
        endDate: ''
    })
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            if (filters.userId) queryParams.append('userId', filters.userId)
            if (filters.status) queryParams.append('status', filters.status)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)
            queryParams.append('page', page)

            // Pass the same date range to all endpoints
            const dateParams = `&startDate=${filters.startDate}&endDate=${filters.endDate}`
            const agentParam = filters.userId ? `&agentId=${filters.userId}` : ''
            const statusParam = filters.status ? `&status=${filters.status}` : ''

            if (activeTab === 'transactions') {
                const txRes = await apiCall(`/api/admin/transactions?${queryParams.toString()}`)
                if (txRes.ok) {
                    setTransactions(txRes.data.data.transactions)
                    setTxPagination(txRes.data.data.pagination)
                }
            } else if (activeTab === 'withdrawals') {
                // For withdrawals, if we need to filter by userId, fetch all and paginate client-side
                if (filters.userId) {
                    // Fetch all withdrawals and filter client-side
                    const wdRes = await apiCall(`/api/admin/withdrawals?status=${filters.status || ''}${dateParams}&limit=1000`)
                    if (wdRes.ok) {
                        let filteredWithdrawals = (wdRes.data.data.withdrawals || []).filter(wd =>
                            wd.user && wd.user._id === filters.userId
                        )
                        setAllWithdrawals(filteredWithdrawals)

                        // Client-side pagination
                        const limit = 20
                        const startIndex = (page - 1) * limit
                        const endIndex = startIndex + limit
                        const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex)

                        setWithdrawals(paginatedWithdrawals)
                        setWdPagination({
                            page: page,
                            limit: limit,
                            total: filteredWithdrawals.length,
                            totalPages: Math.ceil(filteredWithdrawals.length / limit)
                        })
                    }
                } else {
                    // Use backend pagination when no userId filter
                    const wdRes = await apiCall(`/api/admin/withdrawals?status=${filters.status || ''}&page=${page}${dateParams}`)
                    if (wdRes.ok) {
                        setWithdrawals(wdRes.data.data.withdrawals || [])
                        setWdPagination(wdRes.data.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 })
                    }
                }
            } else if (activeTab === 'clicks') {
                // For clicks, if we need to filter by status, fetch all and paginate client-side
                if (filters.status) {
                    const clicksQuery = new URLSearchParams({
                        page: '1',
                        limit: '1000' // Fetch all for filtering
                    })
                    if (filters.userId) clicksQuery.append('agentId', filters.userId)
                    if (filters.startDate) clicksQuery.append('startDate', filters.startDate)
                    if (filters.endDate) clicksQuery.append('endDate', filters.endDate)

                    const clicksRes = await apiCall(`/api/admin/analytics/clicks?${clicksQuery.toString()}`)
                    if (clicksRes.ok && clicksRes.data?.success) {
                        // Filter by status on client side
                        let filteredClicks = (clicksRes.data.data.clicks || []).filter(click => {
                            if (filters.status === 'pending') return click.commissionStatus === 'pending'
                            if (filters.status === 'completed') return click.commissionStatus === 'completed'
                            if (filters.status === 'failed') return click.commissionStatus === 'failed'
                            if (filters.status === 'ineligible') return click.commissionStatus === 'none'
                            return true
                        })
                        setAllClicks(filteredClicks)

                        // Client-side pagination
                        const limit = 20
                        const startIndex = (page - 1) * limit
                        const endIndex = startIndex + limit
                        const paginatedClicks = filteredClicks.slice(startIndex, endIndex)

                        setProductClicks(paginatedClicks)
                        setClicksPagination({
                            page: page,
                            limit: limit,
                            total: filteredClicks.length,
                            totalPages: Math.ceil(filteredClicks.length / limit)
                        })
                    }
                } else {
                    // Use backend pagination when no status filter
                    const clicksQuery = new URLSearchParams({
                        page: page.toString(),
                        limit: '20'
                    })
                    if (filters.userId) clicksQuery.append('agentId', filters.userId)
                    if (filters.startDate) clicksQuery.append('startDate', filters.startDate)
                    if (filters.endDate) clicksQuery.append('endDate', filters.endDate)

                    const clicksRes = await apiCall(`/api/admin/analytics/clicks?${clicksQuery.toString()}`)
                    if (clicksRes.ok && clicksRes.data?.success) {
                        setProductClicks(clicksRes.data.data.clicks || [])
                        setClicksPagination(clicksRes.data.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 })
                    }
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filters, page, activeTab])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Reset page when tab or filters change
    useEffect(() => {
        setPage(1)
    }, [activeTab, filters.userId, filters.status, filters.startDate, filters.endDate])

    const handleWithdrawalAction = async (id, status) => {
        try {
            const notes = prompt('Enter admin notes (optional):')
            const res = await apiCall(`/api/admin/withdrawals/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status, adminNotes: notes })
            })
            if (res.ok) {
                fetchData()
                alert(`Withdrawal ${status} successfully`)
            } else {
                alert(res.data.message || 'Operation failed')
            }
        } catch (err) {
            alert(err.message)
        }
    }

    const handleTransactionAction = async (id, status) => {
        try {
            const res = await apiCall(`/api/admin/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                fetchData()
                alert(`Commission ${status === 'completed' ? 'Accepted' : 'Rejected'} successfully`)
            } else {
                alert(res.data.message || 'Operation failed')
            }
        } catch (err) {
            alert(err.message)
        }
    }

    const handleClickAction = async (click, status) => {
        try {
            // If no transaction exists (ineligible), create one first
            if (!click.transactionId) {
                if (!click.agent || !click.agent._id) {
                    alert('Cannot create commission: No agent associated with this click')
                    return
                }

                // Create transaction with the desired status
                const createRes = await apiCall(`/api/admin/transactions/create-for-click`, {
                    method: 'POST',
                    body: JSON.stringify({
                        productClickId: click._id,
                        status: status // Create with completed or failed status directly
                    })
                })

                if (createRes.ok) {
                    fetchData()
                    alert(`Commission ${status === 'completed' ? 'Accepted' : 'Rejected'} successfully`)
                } else {
                    alert(createRes.data.message || 'Failed to create transaction')
                }
            } else {
                // Update existing transaction
                const res = await apiCall(`/api/admin/transactions/${click.transactionId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                })
                if (res.ok) {
                    fetchData()
                    alert(`Commission ${status === 'completed' ? 'Accepted' : 'Rejected'} successfully`)
                } else {
                    alert(res.data.message || 'Operation failed')
                }
            }
        } catch (err) {
            alert(err.message || 'Operation failed')
        }
    }

    return (
        <div className="p-8 min-h-screen bg-[#fafafa]">
            <div className="mb-12">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Commissions<span className="text-secondary">.</span></h1>
                    <button
                        onClick={fetchData}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-white rounded-full hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                        Refresh Data
                    </button>
                </div>
                <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Financial Monitoring & Payouts</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-black">Total Payouts Pending</p>
                    <p className="text-3xl font-black text-secondary">
                        {withdrawals.filter(w => w.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-black">Under Review</p>
                    <p className="text-3xl font-black text-orange-600">
                        {activeTab === 'transactions' ? transactions.filter(tx => tx.status === 'pending').length :
                            activeTab === 'clicks' ? productClicks.filter(c => c.commissionStatus === 'pending' || c.commissionStatus === 'none').length :
                                withdrawals.filter(w => w.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-black">Ledger Entries</p>
                    <p className="text-3xl font-black text-primary">
                        {activeTab === 'transactions' ? transactions.length :
                            activeTab === 'clicks' ? productClicks.length :
                                withdrawals.length}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'transactions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                    Agent Earnings
                </button>
                <button
                    onClick={() => setActiveTab('clicks')}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'clicks' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                    Product Clicks & Earnings
                </button>
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'withdrawals' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                    Withdrawal Requests
                </button>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-8 items-end flex-wrap">
                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Filter by Agent</label>
                    <select
                        value={filters.userId}
                        onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1 min-w-[200px] bg-transparent"
                    >
                        <option value="">All Agents</option>
                        {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Filter by Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary px-1 min-w-[140px] bg-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Under Review</option>
                        <option value="completed">Accepted</option>
                        <option value="failed">Rejected</option>
                        {activeTab === 'clicks' && <option value="ineligible">Ineligible</option>}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">From Date</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">To Date</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                        className="text-xs font-bold border-b border-gray-100 pb-1 outline-none focus:border-primary"
                    />
                </div>

                <button
                    onClick={() => setFilters({ userId: '', status: '', startDate: '', endDate: '' })}
                    className="text-[10px] font-black uppercase text-gray-300 hover:text-primary transition-colors mb-1"
                >
                    Clear Filters
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-300">Auditing Accounts...</div>
            ) : activeTab === 'clicks' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Commission</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {productClicks.length > 0 ? productClicks.map(click => (
                                <tr key={click._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary truncate max-w-xs">{click.productName}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-black">ASIN: {click.asin}</p>
                                        <p className="text-[9px] text-gray-300">{click.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {click.agent ? (
                                            <>
                                                <p className="text-xs font-bold text-secondary">{click.agent.name}</p>
                                                <p className="text-[9px] text-gray-400 uppercase font-black">{click.agent.referralCode}</p>
                                            </>
                                        ) : (
                                            <span className="text-[9px] text-gray-300 italic">No Agent</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-center text-gray-700">
                                        {formatCurrency(click.price || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-center text-green-600">
                                        {formatCurrency(click.commissionAmount || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${click.commissionStatus === 'pending' ? 'bg-orange-50 text-orange-600' :
                                            click.commissionStatus === 'completed' ? 'bg-green-50 text-green-600' :
                                                click.commissionStatus === 'failed' ? 'bg-red-50 text-red-600' :
                                                    'bg-gray-50 text-gray-400'
                                            }`}>
                                            {click.commissionStatus === 'pending' ? 'Under Review' :
                                                click.commissionStatus === 'completed' ? 'Accepted' :
                                                    click.commissionStatus === 'failed' ? 'Rejected' :
                                                        'Ineligible'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[10px] font-bold text-gray-300">{formatDate(click.createdAt)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(click.commissionStatus === 'pending' || click.commissionStatus === 'none') && click.agent ? (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleClickAction(click, 'completed')}
                                                    className="bg-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-md hover:bg-black active:scale-95 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleClickAction(click, 'failed')}
                                                    className="border border-gray-100 text-gray-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : click.commissionStatus === 'none' && !click.agent ? (
                                            <span className="text-[10px] font-bold text-gray-300 italic">No Agent</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-gray-300 text-sm">
                                        No product clicks found for the selected filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'transactions' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary">{tx.user?.name}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-black">{tx.user?.referralCode}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${tx.type === 'earnings' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-xs font-black text-center ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-gray-500 max-w-xs truncate">{tx.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${tx.status === 'pending' ? 'bg-orange-50 text-orange-600' : tx.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {tx.status === 'pending' ? 'Under Review' : tx.status === 'completed' ? 'Accepted' : 'Rejected'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.status === 'pending' ? (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleTransactionAction(tx._id, 'completed')}
                                                    className="bg-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-md hover:bg-black active:scale-95 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleTransactionAction(tx._id, 'failed')}
                                                    className="border border-gray-100 text-gray-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300">{formatDate(tx.createdAt)}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {withdrawals.map(wd => (
                                <tr key={wd._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-primary">{wd.user?.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold tracking-tight">Balance: {formatCurrency(wd.user?.balance)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-primary text-center">{formatCurrency(wd.amount)}</td>
                                    <td className="px-6 py-4 text-[11px] text-gray-500 font-medium uppercase">{wd.paymentMethod}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${wd.status === 'pending' ? 'bg-orange-50 text-orange-600' : wd.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {wd.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end items-center">
                                            <button
                                                onClick={() => setSelectedWithdrawal(wd)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-all mr-2"
                                            >
                                                View
                                            </button>
                                            {wd.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleWithdrawalAction(wd._id, 'approved')}
                                                        className="bg-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-md hover:bg-black active:scale-95 transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleWithdrawalAction(wd._id, 'rejected')}
                                                        className="border border-gray-100 text-gray-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300">{formatDate(wd.createdAt)}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Withdrawal Details Modal */}
            {selectedWithdrawal && (
                <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Withdrawal Details</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Transaction audit</p>
                            </div>
                            <button
                                onClick={() => setSelectedWithdrawal(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-400 hover:text-primary shadow-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Agent Info Section */}
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Requester Information</label>
                                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20">
                                        {selectedWithdrawal.user?.name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-primary">{selectedWithdrawal.user?.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedWithdrawal.user?.referralCode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Details Section */}
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Payout Configuration</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Amount</p>
                                        <p className="text-lg font-black text-primary">{formatCurrency(selectedWithdrawal.amount)}</p>
                                    </div>
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Method</p>
                                        <p className="text-lg font-black text-secondary">{selectedWithdrawal.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details Input by User */}
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">User Provided Details</label>
                                <div className="p-5 bg-secondary/5 border border-secondary/10 rounded-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {selectedWithdrawal.paymentDetails ? (() => {
                                        let details = selectedWithdrawal.paymentDetails;
                                        let isObject = typeof details === 'object';

                                        // Attempt to parse if it's a JSON string
                                        if (!isObject && typeof details === 'string' && (details.startsWith('{') || details.startsWith('['))) {
                                            try {
                                                details = JSON.parse(details);
                                                isObject = true;
                                            } catch (e) {
                                                // Not valid JSON, keep as string
                                            }
                                        }

                                        if (isObject) {
                                            return (
                                                <div className="space-y-3">
                                                    {Object.entries(details).map(([key, value]) => (
                                                        <div key={key} className="flex flex-col pb-2 border-b border-secondary/5 last:border-0">
                                                            <span className="text-[9px] uppercase font-black text-gray-400 mb-0.5">{key.replace(/([A-Z]|_)/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                                            <span className="text-xs font-bold text-primary break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value || '—')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        return <p className="text-xs font-bold text-primary whitespace-pre-wrap">{details}</p>;
                                    })() : (
                                        <p className="text-xs font-bold text-gray-300 italic">No specific details provided by agent.</p>
                                    )}
                                </div>
                            </div>

                            {/* Admin Notes if any */}
                            {selectedWithdrawal.adminNotes && (
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Admin Verification Notes</label>
                                    <p className="text-xs font-medium text-gray-500 italic p-4 bg-orange-50/50 rounded-xl border border-orange-100">{selectedWithdrawal.adminNotes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
                            {selectedWithdrawal.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleWithdrawalAction(selectedWithdrawal._id, 'approved');
                                            setSelectedWithdrawal(null);
                                        }}
                                        className="flex-1 bg-primary text-white text-[10px] font-black uppercase py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Approve Request
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleWithdrawalAction(selectedWithdrawal._id, 'rejected');
                                            setSelectedWithdrawal(null);
                                        }}
                                        className="flex-1 bg-white border border-gray-100 text-red-500 text-[10px] font-black uppercase py-4 rounded-2xl hover:bg-red-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedWithdrawal.status !== 'pending' && (
                                <button
                                    onClick={() => setSelectedWithdrawal(null)}
                                    className="w-full bg-primary text-white text-[10px] font-black uppercase py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all"
                                >
                                    Dismiss Audit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-12">
                <Pagination
                    currentPage={page}
                    totalPages={
                        activeTab === 'transactions' ? txPagination.totalPages :
                            activeTab === 'clicks' ? clicksPagination.totalPages :
                                wdPagination.totalPages
                    }
                    totalItems={
                        activeTab === 'transactions' ? txPagination.total :
                            activeTab === 'clicks' ? clicksPagination.total :
                                wdPagination.total
                    }
                    itemsPerPage={
                        activeTab === 'transactions' ? txPagination.limit :
                            activeTab === 'clicks' ? clicksPagination.limit :
                                wdPagination.limit
                    }
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </div>
    )
}

// Simple internal Pagination component to avoid missing imports in this file
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
    // Always show pagination, even if only 1 page (for consistency)
    const displayTotalPages = Math.max(1, totalPages)
    const displayTotalItems = totalItems || 0

    return (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                {displayTotalItems} total records
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-6 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
                >
                    Prev
                </button>
                <div className="flex items-center px-4 text-[10px] font-black uppercase tracking-widest text-primary">
                    {currentPage} / {displayTotalPages}
                </div>
                <button
                    disabled={currentPage >= displayTotalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-6 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default Commissions
