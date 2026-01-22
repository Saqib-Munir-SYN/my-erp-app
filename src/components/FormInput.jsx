import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
            ? `border-red-500 focus:ring-red-500 ${isDark ? 'bg-red-950 text-white' : 'bg-red-50'}`
            : `focus:ring-blue-500 hover:border-blue-400 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-slate-300 bg-white'}`
        } ${disabled ? `cursor-not-allowed ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100'}` : ''}`}
      />
      {touched && error && (
        <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠ {error}</p>
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
  const { isDark } = useTheme();
  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
            ? `border-red-500 focus:ring-red-500 ${isDark ? 'bg-red-950 text-white' : 'bg-red-50'}`
            : `focus:ring-blue-500 hover:border-blue-400 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-slate-300 bg-white'}`
        } ${disabled ? `cursor-not-allowed ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100'}` : ''}`}
      >
        <option value="">Select {label?.toLowerCase() || 'option'}</option>
        {options?.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠ {error}</p>
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
})const { isDark } = useTheme();
  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
            ? `border-red-500 focus:ring-red-500 ${isDark ? 'bg-red-950 text-white' : 'bg-red-50'}`
            : `focus:ring-blue-500 hover:border-blue-400 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-slate-300 bg-white'}`
        } ${disabled ? `cursor-not-allowed ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100'}` : ''}`}
      />
      {touched && error && (
        <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}
        <p className="text-red-500 text-xs font-semibold mt-1">⚠ {error}</p>
      )}
    </div>
  );
}