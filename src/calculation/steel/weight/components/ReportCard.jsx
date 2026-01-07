import React from 'react';

const ReportCard = ({ title, items }) => {
    return (
        <div className="mb-4 rounded-2xl border border-[#060C120F] bg-white px-4 py-6">
            <h3 className=" text-lg font-medium text-primary pb-3 border-b border-lightGray">{title}</h3>
            <div className="pt-4">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center space-y-1">
                        <span className="text-primary">{item.label}:</span>
                        <span className={`font-medium ${item.isHighlight ? 'text-primary' : 'text-secondary font-medium'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportCard;
