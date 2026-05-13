const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg outline-none
          focus:border-blue-500 transition-colors duration-200 bg-white
          text-gray-700 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
