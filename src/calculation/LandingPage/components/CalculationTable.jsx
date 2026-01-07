import React from 'react';

const CalculationTable = ({ title, data, headers }) => {
    return (
        <div className="mb-10 w-full overflow-hidden">
            <h3 className="text-[18px] font-medium text-primary mb-4 ml-1">
                {title}
            </h3>

            <div className="bg-white rounded-xl border border-[#ECECEF] overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[320px]">
                    <thead>
                        <tr className="bg-[#F7F7F7] border-b border-[#ECECEF]">
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 text-sm font-medium text-primary border-r border-[#ECECEF] last:border-r-0"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#060C1208]">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-[#F9F9F9] transition-colors">
                                {Object.values(row).map((value, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 text-sm text-secondary font-medium border-r border-[#ECECEF] last:border-r-0"
                                    >
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CalculationTable;
