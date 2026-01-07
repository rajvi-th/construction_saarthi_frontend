import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
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
        { name: t('steel.weight.diameter'), symbol: 'd', value: `${data.diameter} mm` },
        { name: t('steel.weight.length'), symbol: 'L', value: `${data.length} m` },
        { name: t('steel.weight.noOfBars'), symbol: 'N', value: `${data.noOfBars} NOS` },
        { name: t('steel.weight.price'), symbol: 'R', value: `${data.price} per kg` },
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
            title: t('steel.weight.totalLength'),
            items: [
                { label: `${t('steel.weight.totalLength')} ${t('steel.weight.formula')}`, value: 'LXN', isHighlight: true },
                { label: t('steel.weight.totalLength'), value: `${totalLength.toFixed(3)} m` }
            ]
        },
        {
            title: t('steel.weight.singleRodWeight'),
            items: [
                { label: `${t('steel.weight.singleRodWeight')} ${t('steel.weight.formula')}`, value: '((dxd)/162.28)XL', isHighlight: true },
                { label: t('steel.weight.singleRodWeight'), value: `${singleRodWeight.toFixed(3)} Kg` }
            ]
        },
        {
            title: t('steel.weight.totalWeight'),
            items: [
                { label: `${t('steel.weight.totalWeight')} ${t('steel.weight.formula')}`, value: '((dxd)/162.28)XLxN', isHighlight: true },
                { label: t('steel.weight.totalWeight'), value: `${totalWeight.toFixed(3)} Kg` }
            ]
        },
        {
            title: t('steel.weight.totalPrice'),
            items: [
                { label: `${t('steel.weight.totalPrice')} ${t('steel.weight.formula')}`, value: '((dxd)/162.28)XLxNxR', isHighlight: true },
                { label: t('steel.weight.totalPrice'), value: `${totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 3 })} ₹` }
            ]
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pb-20">
            <div className="flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-6 h-6 text-primary" />
                    </button>
                    <h1 className="text-xl font-bold text-primary">
                        {data.history ? t('steel.weight.reinforcement') : t('steel.weight.detailedReport')}
                    </h1>
                </div>
                {data.date && data.time && (
                    <span className="text-secondary text-sm font-medium">
                        {data.date} {data.time}
                    </span>
                )}
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-medium text-primary mb-4">{t('steel.weight.inputs')}</h2>
                <InputTable data={inputData} />

                <h2 className="text-lg font-medium text-primary mb-4 mt-10">{t('steel.weight.outputs')}</h2>
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
