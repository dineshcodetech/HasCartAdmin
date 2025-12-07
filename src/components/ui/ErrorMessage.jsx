/**
 * Error Message Component
 */
export default function ErrorMessage({ message, onDismiss, className = '' }) {
  if (!message) return null

  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 ${className}`}>
      <span className="text-lg">⚠️</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="text-red-600 hover:text-red-800 font-bold text-xl leading-none px-2 py-1 transition-colors"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}

