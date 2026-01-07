import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import InputTable from '../components/InputTable';
import ReportCard from '../components/ReportCard';

const ReinforcementDetailedReport = () => {
    const { t } = useTranslation('calculation');
    const location = useLocation();
    const navigate = useNavigate();

    // Get data from location state or use dummy data for preview
    const data = location.state || {
        diameter: '10',
        length: '3.048',
        noOfBars: '20',
        price: '200',
        unitType: 'metric'
    };

    const inputData = [
        { name: 'Diameter', symbol: 'd', value: `${data.diameter} mm` },
        { name: 'Length', symbol: 'L', value: `${data.length} m` },
        { name: 'No of Bars', symbol: 'N', value: `${data.noOfBars} NOS` },
        { name: 'Price', symbol: 'R', value: `${data.price} per kg` },
    ];

    // Dynamic Calculations
    const d = parseFloat(data.diameter) || 0;
    const L = parseFloat(data.length) || 0;
    const N = parseFloat(data.noOfBars) || 0;
    const R = parseFloat(data.price) || 0;

    const totalLength = L * N;
    const unitWeight = (d * d) / 162.28;
    const singleRodWeight = unitWeight * L;
    const totalWeight = singleRodWeight * N;
    const totalPrice = totalWeight * R;

    const outputSections = [
        {
            title: 'Total Length',
            items: [
                { label: 'Total Length Formula', value: 'LXN', isHighlight: true },
                { label: 'Total Length', value: `${totalLength.toFixed(3)} m` }
            ]
        },
        {
            title: 'Single Rod Weight',
            items: [
                { label: 'Single Rod Weight Formula', value: '((dxd)/162.28)XL', isHighlight: true },
                { label: 'Single Rod Weight', value: `${singleRodWeight.toFixed(3)} Kg` }
            ]
        },
        {
            title: 'Total Weight',
            items: [
                { label: 'Total Weight Formula', value: '((dxd)/162.28)XLxN', isHighlight: true },
                { label: 'Total Weight', value: `${totalWeight.toFixed(3)} Kg` }
            ]
        },
        {
            title: 'Total Price',
            items: [
                { label: 'Total Price Formula', value: '((dxd)/162.28)XLxNxR', isHighlight: true },
                { label: 'Total Price', value: `${totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 3 })} ₹` }
            ]
        }
    ];

    return (
        <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 pb-20">
            <PageHeader
                title="Reinforcement Weight Detailed Report"
                showBackButton
                onBack={() => navigate(-1)}
            />

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Inputs</h2>
                <InputTable data={inputData} />

                <h2 className="text-2xl font-bold text-primary mb-6 mt-10">Outputs</h2>
                <div className="grid grid-cols-1 gap-4">
                    {outputSections.map((section, index) => (
                        <ReportCard
                            key={index}
                            title={section.title}
                            items={section.items}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReinforcementDetailedReport;
