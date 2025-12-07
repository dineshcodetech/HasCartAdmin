/**
 * Dashboard Page Component
 * Displays overview statistics and recent activity
 */
import { useDashboardStats } from '../hooks'
import { formatCurrency, formatNumber } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-gray-900 text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-600 text-base m-0">Welcome to HasCart Admin Panel</p>
        </div>
        {error && (
          <Button 
            variant="secondary" 
            size="small" 
            onClick={refetch}
            disabled={loading}
          >
            Retry
          </Button>
        )}
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => {}} 
          className="mb-6"
        />
      )}

      {loading ? (
        <LoadingSpinner 
          size="large" 
          message="Loading dashboard data..." 
          className="py-20"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="flex items-center gap-4 p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl">👥</div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
                <p className="text-gray-900 text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl">📦</div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
                <p className="text-gray-900 text-2xl font-bold">{formatNumber(stats.totalProducts)}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl">🛒</div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders</h3>
                <p className="text-gray-900 text-2xl font-bold">{formatNumber(stats.totalOrders)}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl">💰</div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
                <p className="text-gray-900 text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </Card>
          </div>

          <div>
            <Card title="Recent Activity">
              <p className="text-center py-12 px-8 text-gray-400 italic">No recent activity to display</p>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
