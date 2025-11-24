/**
 * PhoneInput Component
 * Phone number input with country code selector
 */

import { useState, useRef, useEffect } from 'react';
import ArrowDownIcon from '../../assets/icons/ArrowDown.svg';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

export default function PhoneInput({
  label,
  placeholder = '000 000 0000',
  value,
  onChange,
  countryCode = '+91',
  onCountryCodeChange,
  required = false,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(
    COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]
  );
  const codeDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (codeDropdownRef.current && !codeDropdownRef.current.contains(e.target)) {
        setIsCodeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCodeSelect = (code) => {
    setSelectedCode(code);
    setIsCodeOpen(false);
    onCountryCodeChange?.(code.code);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}

      <div className={`
        relative flex items-center rounded-lg border bg-white
        ${error 
          ? 'border-accent focus-within:border-accent' 
          : 'border-gray-200 focus-within:border-[rgba(6,12,18,0.3)]'
        }
        ${disabled ? 'opacity-50 bg-gray-50' : ''}
        transition-colors
      `}>
        {/* Country Code Selector */}
        <div className="relative" ref={codeDropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsCodeOpen(!isCodeOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-2.5 rounded-l-lg
              bg-transparent text-primary focus:outline-none transition-colors
              ${disabled 
                ? 'cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
          >
            <span className="text-sm font-medium text-primary">{selectedCode.code}</span>
            <img 
              src={ArrowDownIcon} 
              alt="Arrow Down" 
              className={`w-4 h-4 transition-transform ${
                isCodeOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Country Code Dropdown */}
          {isCodeOpen && !disabled && (
            <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCodeSelect(country)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>{country.flag}</span>
                  <span className="font-medium">{country.code}</span>
                  <span className="text-secondary text-xs">{country.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Phone Number Input */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onKeyPress={(e) => {
            // Only allow numbers and spaces
            if (!/[0-9\s]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            // Only allow numbers and spaces
            const numericValue = e.target.value.replace(/[^0-9\s]/g, '');
            if (onChange) {
              // Create a synthetic event with the filtered value
              const syntheticEvent = {
                ...e,
                target: {
                  ...e.target,
                  value: numericValue
                }
              };
              onChange(syntheticEvent);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 px-4 py-2.5 rounded-r-lg bg-transparent
            text-primary placeholder:text-secondary focus:outline-none
            ${disabled 
              ? 'cursor-not-allowed' 
              : 'cursor-text'
            }
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}

