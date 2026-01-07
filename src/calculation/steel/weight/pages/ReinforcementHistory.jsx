import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import ROUTES_FLAT from '../../../../constants/routes';

const HistoryItem = ({ date, time, title, data }) => {
    const { t } = useTranslation('calculation');
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    return (
        <div className="mb-6 bg-white rounded-3xl border border-[#060C120F] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex justify-between items-start cursor-pointer transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <span className="text-[#4A4A4A] text-sm mb-2 block">{date} {time}</span>
                    <h3 className="text-lg font-medium text-primary">{t('history.materialQuantity')}</h3>
                </div>
                <div className="mt-1">
                    {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-accent" />
                    ) : (
                        <ChevronDown className="w-6 h-6 text-accent" />
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="px-6 pb-6">
                    {/* Table */}
                    <div className="rounded-2xl border border-[#060C120F] bg-white overflow-hidden mb-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8F9FA]/50 border-b border-[#060C120A]">
                                    <th className="px-6 py-4 text-sm font-medium text-primary">{t('history.headers.material')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-l border-[#060C120A]">{t('history.headers.quantity')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-l border-[#060C120A]">{t('history.headers.unit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 text-sm text-primary">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-l border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-l border-[#060C120A]">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Action */}
                    <div
                        onClick={() => navigate(ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT_DETAILED, {
                            state: { ...data, date, time, history: true }
                        })}
                        className="flex justify-end items-center gap-1 "
                    >
                        <div className='group flex items-center gap-1 cursor-pointer'>
                            <span className="text-base font-medium text-primary hover:text-accent transition-colors">{t('steel.weight.viewReport')}</span>
                            <ChevronRight className="w-5 h-5 text-primary hover:text-accent transition-all group-hover:text-accent" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReinforcementHistory = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    // Mock dynamic data
    const historyData = [
        {
            date: '31-10-2025',
            time: '10:00am',
            title: 'Reinforcement Weight',
            data: [
                { material: 'Total Length', quantity: '60.960', unit: 'm' },
                { material: 'Single Road We.', quantity: '1.878', unit: 'Kg' },
                { material: 'Total Weight', quantity: '37.565', unit: 'Kg' },
                { material: 'Total Price', quantity: '7512.941', unit: '₹' },
            ]
        },
        {
            date: '26-10-2025',
            time: '03:45pm',
            title: 'Reinforcement Weight',
            data: [
                { material: 'Total Length', quantity: '80.120', unit: 'm' },
                { material: 'Single Road We.', quantity: '2.500', unit: 'Kg' },
                { material: 'Total Weight', quantity: '45.000', unit: 'Kg' },
                { material: 'Total Price', quantity: '9000.000', unit: '₹' },
            ]
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pb-20">
            <PageHeader
                title={`History • ${t('steel.weight.reinforcement')}`}
                showBackButton
                onBack={() => navigate(-1)}
            />

            <div className="mt-8">
                {historyData.map((item, index) => (
                    <HistoryItem
                        key={index}
                        date={item.date}
                        time={item.time}
                        title={item.title}
                        data={item.data}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReinforcementHistory;
