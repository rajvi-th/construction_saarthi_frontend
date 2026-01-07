import React from 'react';

const InputTable = ({ data }) => {
    return (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#060C120A] bg-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#060C120A]">
                        <th className="px-6 py-4 text-sm font-semibold text-primary">Input Name</th>
                        <th className="px-6 py-4 text-sm font-semibold text-primary border-l border-[#060C120A]">Symbol</th>
                        <th className="px-6 py-4 text-sm font-semibold text-primary border-l border-[#060C120A]">Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#060C120A]">
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 text-sm text-secondary font-medium">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-secondary font-medium border-l border-[#060C120A]">{item.symbol}</td>
                            <td className="px-6 py-4 text-sm text-primary font-medium border-l border-[#060C120A]">{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InputTable;
