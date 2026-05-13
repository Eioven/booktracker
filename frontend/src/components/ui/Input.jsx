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
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
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
        <span className="text-red-500 text-sm">{error}</span>
      )}

    </div>
  )
}

export default Input
