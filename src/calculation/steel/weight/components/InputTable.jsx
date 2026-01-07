import React from 'react';
import { useTranslation } from 'react-i18next';

const InputTable = ({ data }) => {
    const { t } = useTranslation('calculation');

    return (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#ECECEF] bg-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 border-b border-[#060C120A]">
                        <th className="px-6 py-4 text-sm font-medium text-primary">{t('steel.weight.inputName')}</th>
                        <th className="px-6 py-4 text-sm font-medium text-primary border-l border-[#060C120A]">{t('steel.weight.symbol')}</th>
                        <th className="px-6 py-4 text-sm font-medium text-primary border-l border-[#060C120A]">{t('steel.weight.value')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#060C120A]">
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 text-sm text-primary">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-primary border-l border-[#060C120A]">{item.symbol}</td>
                            <td className="px-6 py-4 text-sm text-primary border-l border-[#060C120A]">{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default InputTable;
