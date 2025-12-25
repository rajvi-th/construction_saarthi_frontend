/**
 * NumberInput Component
 * Input field for numbers that prevents negative values
 */

export default function NumberInput({
  label,
  placeholder = '0',
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  unit,
  showCurrency = false,
  ...props
}) {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty string, numbers, and decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      // Prevent negative values
      const numValue = parseFloat(inputValue);
      if (inputValue === '' || (!isNaN(numValue) && numValue >= 0)) {
        onChange(e);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-normal text-black mb-2">
          {label}
          {required &&<span>*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {showCurrency && (
          <span className="absolute left-4 text-md text-secondary font-normal z-10">₹</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full py-2.5 rounded-lg border bg-white text-primary 
            placeholder:text-secondary focus:outline-none transition-colors
            ${showCurrency ? 'pl-8' : 'pl-4'}
            ${unit ? 'pr-16' : 'pr-4'}
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
        {unit && (
          <span className="absolute right-4 text-sm text-secondary whitespace-nowrap pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}

