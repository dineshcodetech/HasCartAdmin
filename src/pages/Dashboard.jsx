import { useState } from 'react'
import { useDashboardStats, useReferralStats } from '../hooks'
import { formatCurrency, formatNumber } from '../utils/formatters'

function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats()
  const {
    stats: refStats,
    loading: refLoading,
    filters,
    setFilters
  } = useReferralStats()

  const StatCard = ({ title, value, color, iconColor = 'primary', subtitle }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${color} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-3xl font-bold text-${iconColor}`}>{value}</p>
        {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  )

  const ActivityItem = ({ title, subtitle, time, icon, value }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-primary truncate max-w-[200px]">{title}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{subtitle}</p>
      </div>
      <div className="text-right">
        {value && <p className="text-sm font-bold text-secondary">{value}</p>}
        <p className="text-[10px] text-gray-400 uppercase font-medium">{time}</p>
      </div>
    </div>
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-8 min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">
            Dashboard<span className="text-secondary">.</span>
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">
            Global Analytics Control Center
          </p>
        </div>
        <button
          onClick={refetch}
          className="text-[10px] font-bold tracking-widest uppercase bg-primary text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-600 font-bold">{error}</p>
          <button
            onClick={refetch}
            className="text-[10px] font-bold tracking-wide uppercase bg-red-600 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <div className="text-primary text-[10px] tracking-[0.2em] font-bold uppercase animate-pulse">Synchronizing Data...</div>
        </div>
      ) : (
        <>
          {/* Main Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Today's Earnings"
              value={formatCurrency(stats.earningsToday)}
              subtitle="2% Comm."
              color="border-l-4 border-l-green-500"
              iconColor="green-600"
            />
            <StatCard
              title="Clicks Today"
              value={formatNumber(stats.clicksBreakdown?.today)}
              color="border-l-4 border-l-secondary"
              iconColor="secondary"
            />
            <StatCard
              title="Total Users"
              value={formatNumber(stats.totalUsers)}
              color="border-l-4 border-l-primary"
            />
            <StatCard
              title="Global Clicks"
              value={formatNumber(stats.totalClicks)}
              color="border-l-4 border-l-gray-800"
              iconColor="gray-800"
            />
          </div>

          {/* Secondary Metrics - Clicks Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">Past 7 Days</p>
              <p className="text-xl font-bold text-primary">{formatNumber(stats.clicksBreakdown?.week)}</p>
              <div className="h-1 w-full bg-primary/10 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">Past 30 Days</p>
              <p className="text-xl font-bold text-secondary">{formatNumber(stats.clicksBreakdown?.month)}</p>
              <div className="h-1 w-full bg-secondary/10 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">Past 365 Days</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(stats.clicksBreakdown?.year)}</p>
              <div className="h-1 w-full bg-gray-200 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-gray-800" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">Total Inventory</p>
              <p className="text-xl font-bold text-primary">{formatNumber(stats.totalProducts)}</p>
              <div className="h-1 w-full bg-primary/10 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Referral Analytics Widget (New Filterable Section) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <div className="flex justify-between items-center mb-8 relative">
                <h2 className="text-sm font-black tracking-widest text-primary uppercase">
                  Referral Performance
                </h2>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="text-[10px] border border-gray-100 rounded px-2 py-1 outline-none focus:border-primary"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="text-[10px] border border-gray-100 rounded px-2 py-1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by Product ASIN..."
                  value={filters.asin}
                  onChange={(e) => handleFilterChange('asin', e.target.value)}
                  className="w-full text-xs font-bold border-b border-gray-100 py-2 outline-none focus:border-primary transition-colors text-primary"
                />
              </div>

              {refLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-[10px] font-bold text-gray-300 animate-pulse">Calculating Ratios...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Agents</p>
                    <p className="text-4xl font-black text-primary">{refStats.agentCount}</p>
                  </div>
                  <div className="text-center border-x border-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Unique Users</p>
                    <p className="text-4xl font-black text-secondary">{refStats.userCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Conversion Clicks</p>
                    <p className="text-4xl font-black text-gray-800">{refStats.totalClicks}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Average Clicks per Agent</p>
                <p className="text-sm font-black text-primary">
                  {refStats.agentCount > 0 ? (refStats.totalClicks / refStats.agentCount).toFixed(1) : 0}
                </p>
              </div>
            </div>

            {/* Interaction Stats */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6">
                Product Interaction
              </h2>
              <div className="space-y-4">
                {stats.topProducts.length > 0 ? stats.topProducts.map((p, idx) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-200 w-4">0{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-primary truncate max-w-[180px]">{p.productName}</p>
                      <p className="text-[9px] text-gray-400 font-medium">ASIN: {p._id}</p>
                    </div>
                    <div className="bg-primary/5 px-2 py-1 rounded text-[10px] font-black text-primary">
                      {p.count}
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 italic">No interaction data yet</p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Role Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Customers', count: stats.totalCustomers, color: 'bg-primary' },
                    { label: 'Agents', count: stats.totalAgents, color: 'bg-secondary' },
                  ].map((role) => (
                    <div key={role.label}>
                      <div className="flex justify-between text-[10px] font-black mb-1 uppercase">
                        <span className="text-gray-500">{role.label}</span>
                        <span className="text-primary">{role.count}</span>
                      </div>
                      <div className="w-full bg-gray-50 h-1 rounded-full overflow-hidden">
                        <div
                          className={`${role.color} h-full transition-all duration-1000`}
                          style={{ width: `${(role.count / stats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity Logs */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center justify-between">
                <span>Recent Registrations</span>
                <a href="/users" className="text-[9px] text-secondary font-black hover:underline uppercase tracking-widest">View All</a>
              </h2>

              <div className="space-y-2">
                {stats.recentUsers.length > 0 ? stats.recentUsers.map(user => (
                  <ActivityItem
                    key={user._id}
                    icon={user.name.charAt(0)}
                    title={user.name}
                    subtitle={`${user.role} • ${user.email}`}
                    time={new Date(user.createdAt).toLocaleDateString()}
                  />
                )) : (
                  <p className="text-xs text-gray-400 italic py-2">No recent registrations</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center justify-between">
                <span>Recent Clicks</span>
                <a href="/analytics" className="text-[9px] text-secondary font-black hover:underline uppercase tracking-widest">Analytics</a>
              </h2>

              <div className="space-y-2">
                {stats.recentClicks.length > 0 ? stats.recentClicks.map(click => (
                  <ActivityItem
                    key={click._id}
                    icon="C"
                    title={click.productName}
                    subtitle={`By ${click.user?.name || 'Guest'}`}
                    value={click.price > 0 ? formatCurrency(click.price) : null}
                    time={new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                )) : (
                  <p className="text-xs text-gray-400 italic py-2">No recent clicks</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

