/**
 * Radio Component
 * Reusable radio button with label and accessibility support
 */

import { Check } from 'lucide-react';

export default function Radio({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label
      className={`
        flex items-center gap-2 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
            ${
              checked
                ? 'border-accent bg-accent'
                : 'border-gray-300 bg-white'
            }
            ${
              disabled
                ? 'cursor-not-allowed'
                : checked
                ? 'hover:border-[#9F290A] hover:bg-[#9F290A]'
                : 'hover:border-gray-400'
            }
          `}
        >
          {checked && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
      {label && (
        <span
          className={`
            text-sm text-primary
            ${disabled ? 'text-secondary' : ''}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
}

