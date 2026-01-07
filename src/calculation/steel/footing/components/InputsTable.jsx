import React from 'react';
import { useTranslation } from 'react-i18next';

const InputsTable = ({ data, title }) => {
    const { t } = useTranslation('calculation');

    return (
        <div className="mt-8 animate-fade-in">
            {title && (
                <h2 className="text-lg font-medium text-primary mb-4 ml-1">{title}</h2>
            )}
            <div className="overflow-x-auto rounded-3xl border border-[#060C120F] bg-white">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#060C120F]">
                            <th className="px-6 py-4 font-medium text-primary">
                                {t('steel.weight.inputName')}
                            </th>
                            <th className="px-6 py-4 font-medium text-primary border-l border-[#060C120F]">
                                {t('steel.weight.symbol')}
                            </th>
                            <th className="px-6 py-4 font-medium text-primary border-l border-[#060C120F]">
                                {t('steel.weight.value')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#060C120F]">
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-3 text-sm text-primary">
                                    {item.name}
                                </td>
                                <td className="px-6 py-3 text-sm text-primary border-l border-[#060C120F]">
                                    {item.symbol}
                                </td>
                                <td className="px-6 py-3 text-sm text-primary border-l border-[#060C120F]">
                                    {item.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InputsTable;
