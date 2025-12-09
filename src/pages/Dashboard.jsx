/**
 * Dashboard Page Component
 * Minimalist design matching React Native pattern
 */
import { useDashboardStats } from '../hooks'
import { formatCurrency, formatNumber } from '../utils/formatters'

function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats()

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-wide text-black mb-2">
          Dashboard.
        </h1>
        <p className="text-xs text-gray-400 tracking-widest uppercase">
          Overview
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-black">{error}</p>
          <button
            onClick={refetch}
            disabled={loading}
            className="mt-2 text-xs font-bold tracking-wide uppercase border-b border-black hover:opacity-70"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-black text-sm tracking-wide">Loading...</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="border-b border-gray-200 pb-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Total Users</p>
              <p className="text-3xl font-light text-black">{formatNumber(stats.totalUsers)}</p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Total Products</p>
              <p className="text-3xl font-light text-black">{formatNumber(stats.totalProducts)}</p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Total Orders</p>
              <p className="text-3xl font-light text-black">{formatNumber(stats.totalOrders)}</p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Total Revenue</p>
              <p className="text-3xl font-light text-black">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-light tracking-wide text-black mb-6">Recent Activity</h2>
            <p className="text-sm text-gray-400 italic">No recent activity to display</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
