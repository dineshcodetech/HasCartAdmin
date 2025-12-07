/**
 * Loading Spinner Component
 */
export default function LoadingSpinner({ size = 'medium', message = 'Loading...', className = '' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size] || sizeClasses.medium} relative`}>
        <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        <div className="absolute inset-4 border-4 border-blue-50 border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}

