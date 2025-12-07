import { useEffect } from 'react'

/**
 * Toast Notification Component
 */
export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!message) return null

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${typeStyles[type] || typeStyles.info} shadow-lg min-w-[300px] max-w-md`}>
      <span className="text-lg flex-shrink-0">{icons[type] || icons.info}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          className="text-current hover:opacity-70 font-bold text-xl leading-none px-2 py-1 transition-opacity flex-shrink-0"
          onClick={onClose}
          aria-label="Close toast"
        >
          ×
        </button>
      )}
    </div>
  )
}

