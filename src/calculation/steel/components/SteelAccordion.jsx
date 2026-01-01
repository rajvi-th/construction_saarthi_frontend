import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SteelAccordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`mb-4 border border-[#ECECEF] rounded-2xl overflow-hidden bg-white transition-all ${isOpen ? 'shadow-sm' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
                <span className="font-medium text-primary">
                    {title}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-accent" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-accent" />
                )}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 py-4 border-t border-[#ECECEF]/50">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SteelAccordion;
