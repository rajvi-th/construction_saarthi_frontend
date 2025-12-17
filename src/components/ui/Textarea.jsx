/**
 * Textarea Component
 * Reusable textarea field with label and error support
 */

export default function Textarea({
  label,
  placeholder = 'Enter details',
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-2.5 rounded-lg border bg-white text-primary 
          placeholder:text-secondary focus:outline-none transition-colors resize-none
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

