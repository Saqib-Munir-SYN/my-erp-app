export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
          touched && error
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-slate-300 focus:ring-blue-500 bg-white hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
      />
      {touched && error && (
        <p className="text-red-500 text-xs font-semibold mt-1">⚠ {error}</p>
      )}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
          touched && error
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-slate-300 focus:ring-blue-500 bg-white hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
      >
        <option value="">Select {label?.toLowerCase() || 'option'}</option>
        {options?.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <p className="text-red-500 text-xs font-semibold mt-1">⚠ {error}</p>
      )}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
          touched && error
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-slate-300 focus:ring-blue-500 bg-white hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
      />
      {touched && error && (
        <p className="text-red-500 text-xs font-semibold mt-1">⚠ {error}</p>
      )}
    </div>
  );
}