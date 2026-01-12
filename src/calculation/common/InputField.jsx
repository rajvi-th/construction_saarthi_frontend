import { ChevronDown } from 'lucide-react';

export default function InputField({
    value,
    onChange,
    placeholder,
    unit,
    suffix,
    onUnitClick,
}) {

    // ✅ POSITIVE NUMBER HANDLER
    const handleChange = (e) => {
        const val = e.target.value;

        // allow empty
        if (val === '') {
            onChange(e);
            return;
        }

        // allow positive digits and decimals
        // Matches: "123", "123.", "123.45", ".45"
        if (/^\d*\.?\d*$/.test(val)) {
            onChange(e);
        }
    };

    return (
        <div className="
      flex items-center
      bg-white rounded-xl
      border border-[#060C121A]
      focus-within:border-accent/40
      transition-all overflow-hidden
      h-[48px] sm:h-[56px] w-full
    ">
            {/* LEFT UNIT */}
            {unit && (
                <button
                    type="button"
                    onClick={onUnitClick}
                    className="
            flex items-center
            justify-center
            gap-1
            px-2
            bg-gray-50/50
            border-r border-[#060C121A]
            min-w-[60px] md:min-w-[70px]
            flex-none
            h-full
          "
                >
                    <span className="text-secondary text-sm sm:text-base font-medium">
                        {unit}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                </button>
            )}

            {/* INPUT */}
            <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="
                    flex-1 h-full
                    px-1 md:px-2
                    text-sm sm:text-base
                    text-primary
                    focus:outline-none
                    min-w-0
                "
            />

            {/* RIGHT SUFFIX */}
            {suffix && (
                <div className="px-2 sm:px-3 text-accent text-sm sm:text-base">
                    {suffix}
                </div>
            )}
        </div>
    );
}
