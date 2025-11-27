import { useState, useRef, useEffect } from "react";
import ArrowDownIcon from "../../assets/icons/ArrowDown.svg";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];

export default function PhoneInput({
  label,
  placeholder = "000 000 0000",
  value = "",
  onChange,
  countryCode = "+91",
  onCountryCodeChange,
  required = false,
  error,
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Format phone number as XXX XXX XXXX
  const formatPhone = (num) => {
    const digits = num.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  };

  const onPhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    const formatted = formatPhone(cleaned);

    onChange &&
      onChange({
        ...e,
        target: { ...e.target, value: formatted },
      });
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          relative flex items-center rounded-lg border bg-white
          ${error ? "border-accent" : "border-gray-200"}
          ${disabled && "opacity-50 bg-gray-50"}
        `}
      >
        {/* Country Code */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 cursor-pointer"
          >
            <span className="text-sm font-medium">{selected.code}</span>
            <img
              src={ArrowDownIcon}
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange?.(c.code);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  <span>{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="text-gray-500 text-xs">{c.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Phone Input */}
        <input
          type="tel"
          inputMode="numeric"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onPhoneChange}
          className="flex-1 px-4 py-2.5 rounded-r-lg bg-transparent text-primary focus:outline-none"
        />
      </div>

      {error && <p className="mt-1 text-sm text-accent">{error}</p>}
    </div>
  );
}
