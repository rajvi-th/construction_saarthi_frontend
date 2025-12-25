/**
 * Filter Component
 * Reusable filter dropdown component for filtering content
 */

import Dropdown from './Dropdown';
import sortVerticalIcon from '../../assets/icons/Sort Vertical.svg';

export default function Filter({
  options = [],
  value,
  onChange,
  placeholder = 'Filter',
  className = '',
}) {
  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      showSeparator={false}
      onAddNew={null}
      addButtonLabel=""
      customButton={(isOpen, setIsOpen, selectedOption) => (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`py-2 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm flex items-center gap-2 cursor-pointer font-light ${className}`}
        >
          <img 
            src={sortVerticalIcon} 
            alt="Filter" 
            className="w-6 h-6 flex-shrink-0"
          />
          <span className="text-primary font-light">{selectedOption?.label || placeholder}</span>
        </button>
      )}
    />
  );
}

