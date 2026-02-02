/**
 * Checkbox Component
 * Reusable checkbox component with Lucide icons
 */

import { Check } from 'lucide-react';

export default function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  labelClassName = '',
  name,
  id,
  ...props
}) {
  const checkboxId = id || name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={`
            w-5 h-5 rounded border-1 flex items-center justify-center cursor-pointer transition-all
            ${
              checked
                ? 'bg-accent border-accent'
                : 'bg-white border-gray-300 hover:border-accent'
            }
            ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }
          `}
        >
          {checked && (
            <Check 
              className="w-3.5 h-3.5 text-white stroke-[3]" 
              strokeWidth={3}
            />
          )}
        </label>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className={`
            text-sm font-medium cursor-pointer select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${checked ? 'text-primary' : 'text-secondary'}
            ${labelClassName}
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
}

