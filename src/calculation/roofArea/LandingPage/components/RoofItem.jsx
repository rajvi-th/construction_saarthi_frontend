import React from 'react';
import { ChevronRight } from 'lucide-react';

const RoofItem = ({ title, icon, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-[#060C1203] rounded-2xl p-2 md:p-4 border border-[#F0F0F0] flex items-center gap-4 cursor-pointer h-full"
        >
            <div className="flex items-center justify-center flex-shrink-0">
                {/* Use the provided icon or a placeholder */}
                <img
                    src={icon}
                    alt={title}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                />
            </div>

            <div className="flex-1">
                <h3 className="text-primary font-medium text-sm md:text-base">{title}</h3>
            </div>
        </div>
    );
};

export default RoofItem;
