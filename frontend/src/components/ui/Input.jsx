import { useId } from 'react'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  id,
}) => {
  const generatedId = useId()
  const inputId = id || name || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={`flex flex-col gap-1 ${className}`}>

      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`
          px-3 py-2 border rounded-lg outline-none
          transition-colors duration-200
          ${error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
      />

      {error && (
        <span id={errorId} role="alert" className="text-red-500 text-sm">{error}</span>
      )}

    </div>
  )
}

export default Input
