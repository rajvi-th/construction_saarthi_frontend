/**
 * SearchBar Component
 * Reusable search input with icon
 */

import { Search } from 'lucide-react';

export default function SearchBar({
  placeholder = 'Search members',
  value,
  onChange,
  className = '',
  defaultValue,
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Search className="w-5 h-5 text-secondary" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-primary placeholder:text-secondary focus:outline-none focus:border-[rgba(6,12,18,0.3)] transition-colors"
        {...props}
      />
    </div>
  );
}

