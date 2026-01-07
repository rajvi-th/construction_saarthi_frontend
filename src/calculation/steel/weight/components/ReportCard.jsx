import React from 'react';

const ReportCard = ({ title, items }) => {
    return (
        <div className="mb-6 rounded-2xl border border-[#060C120A] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-primary">{title}</h3>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 first:pt-0 last:pb-0 border-b border-[#060C1205] last:border-0">
                        <span className="text-secondary font-medium">{item.label}:</span>
                        <span className={`font-semibold ${item.isHighlight ? 'text-primary' : 'text-secondary font-bold'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportCard;
