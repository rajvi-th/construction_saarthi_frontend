/**
 * Toggle Component
 * Reusable toggle/switch component for on/off states
 */

import React from 'react';

export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label = '',
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  ...props
}) {
  const sizes = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'h-6 w-12',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6',
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizeClasses = sizes[size] || sizes.md;

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <div
          className={`
            ${sizeClasses.track} rounded-full bg-gray-300
            transition-colors duration-200
            peer-checked:bg-accent
            ${checked ? 'shadow-[0_2px_4px_rgba(0,0,0,0.1)]' : ''}
          `}
        />
        <div
          className={`
            absolute top-0.5 left-0.5 ${sizeClasses.thumb} rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]
            transform transition-transform duration-200
            ${checked ? sizeClasses.translate : 'translate-x-0'}
          `}
        />
      </div>
      {label ? <span className="text-sm select-none">{label}</span> : null}
    </label>
  );
}

