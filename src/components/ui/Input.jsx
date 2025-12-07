/**
 * Reusable Input Component
 */
export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  const inputId = id || name
  const hasError = !!error

  return (
    <div className={`flex flex-col gap-2 mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-md transition-all duration-200 font-inherit outline-none focus:ring-3 focus:ring-opacity-10 ${
          hasError
            ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      />
      {hasError && <span className="text-xs text-red-600 -mt-1">{error}</span>}
    </div>
  )
}

