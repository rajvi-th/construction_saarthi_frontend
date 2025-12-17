/**
 * Select Component
 * Simple select dropdown component
 */

import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
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
      
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-lg border bg-white text-primary 
            appearance-none focus:outline-none transition-colors
            ${error 
              ? 'border-accent focus:border-accent' 
              : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-50' 
              : 'cursor-pointer'
            }
            ${!value ? 'text-secondary' : ''}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-secondary" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}

