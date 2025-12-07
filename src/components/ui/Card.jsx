/**
 * Reusable Card Component
 */
export default function Card({
  children,
  title,
  className = '',
  headerAction,
  ...props
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`} {...props}>
      {title && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 m-0">{title}</h3>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

