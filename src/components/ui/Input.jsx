/**
 * Input Component
 * Reusable input field with label and error support
 */

export default function Input({
  label,
  placeholder = 'Enter name',
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-normal text-black mb-2">
          {label}
          {required &&<span>*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border bg-white text-primary 
          placeholder:text-secondary text-sm focus:outline-none transition-colors
          ${error 
            ? 'border-accent focus:border-accent' 
            : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
            : 'cursor-text'
          }
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}
