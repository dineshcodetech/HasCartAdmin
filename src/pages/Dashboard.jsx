/**
 * Dashboard Page Component
 * Minimalist design matching React Native pattern
 */
import { useDashboardStats } from '../hooks'
import { formatCurrency, formatNumber } from '../utils/formatters'

function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats()

  const StatCard = ({ title, value, color, iconColor = 'primary' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${color} hover:shadow-md transition-shadow`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{title}</p>
      <p className={`text-3xl font-bold text-${iconColor}`}>{value}</p>
    </div>
  )

  const ActivityItem = ({ title, subtitle, time, icon }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-primary">{title}</p>
        <p className="text-xs text-gray-400 uppercase tracking-tighter">{subtitle}</p>
      </div>
      <p className="text-[10px] text-gray-400 uppercase font-medium">{time}</p>
    </div>
  )

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-primary mb-2">
            Dashboard.
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">
            Overview & Analytics
          </p>
        </div>
        <button
          onClick={refetch}
          className="text-[10px] font-bold tracking-widest uppercase bg-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <p className="text-sm text-primary font-bold">{error}</p>
          <button
            onClick={refetch}
            disabled={loading}
            className="mt-2 text-xs font-bold tracking-wide uppercase border-b border-primary text-primary hover:opacity-70"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-primary text-sm tracking-wide font-bold animate-pulse">Loading Dashboard...</div>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Users"
              value={formatNumber(stats.totalUsers)}
              color="border-l-4 border-l-primary"
            />
            <StatCard
              title="Products Listed"
              value={formatNumber(stats.totalProducts)}
              color="border-l-4 border-l-secondary"
              iconColor="secondary"
            />
            <StatCard
              title="Categories"
              value={formatNumber(stats.totalCategories)}
              color="border-l-4 border-l-primary"
            />
            <StatCard
              title="Product Clicks"
              value={formatNumber(stats.totalClicks)}
              color="border-l-4 border-l-secondary"
              iconColor="secondary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Distribution */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-6 flex justify-between">
                <span>User Roles</span>
                <span className="text-secondary">{stats.totalUsers}</span>
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Customers', count: stats.totalCustomers, color: 'bg-primary' },
                  { label: 'Agents', count: stats.totalAgents, color: 'bg-secondary' },
                  { label: 'Admins', count: stats.totalAdmins, color: 'bg-gray-800' },
                ].map((role) => (
                  <div key={role.label}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight">
                      <span>{role.label}</span>
                      <span>{role.count}</span>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className={`${role.color} h-full transition-all duration-1000`}
                        style={{ width: `${(role.count / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-10 border-t border-gray-50 pt-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="/categories" className="text-center p-3 rounded-xl bg-primary/5 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors">
                    Add Category
                  </a>
                  <a href="/banners" className="text-center p-3 rounded-xl bg-secondary/5 text-secondary text-[10px] font-bold uppercase hover:bg-secondary/10 transition-colors">
                    New Banner
                  </a>
                </div>
              </div>
            </div>

            {/* Recent Activity Logs */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-6 flex items-center justify-between">
                <span>Recent Activity</span>
                <span className="text-[10px] text-gray-300 font-normal">Last 5 entries</span>
              </h2>

              <div className="space-y-6">
                {/* Registrations */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">New Registrations</h3>
                  {stats.recentUsers.length > 0 ? stats.recentUsers.map(user => (
                    <ActivityItem
                      key={user._id}
                      icon="U"
                      title={user.name}
                      subtitle={user.email}
                      time={new Date(user.createdAt).toLocaleDateString()}
                    />
                  )) : (
                    <p className="text-xs text-gray-400 italic py-2">No recent registrations</p>
                  )}
                </div>

                {/* Clicks */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Product Interactions</h3>
                  {stats.recentClicks.length > 0 ? stats.recentClicks.map(click => (
                    <ActivityItem
                      key={click._id}
                      icon="P"
                      title={click.productName}
                      subtitle={`Viewed by ${click.user?.name || 'Guest'}`}
                      time={new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                  )) : (
                    <p className="text-xs text-gray-400 italic py-2">No recent clicks</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
