import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Download, ChevronDown, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import DropdownMenu from '../../../../components/ui/DropdownMenu';
import footType1 from '../../../../assets/icons/footType1.svg';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';

import InputsTable from '../components/InputsTable';
import OutputCard from '../components/OutputCard';

const FootingType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Footing Size
    const [sideX, setSideX] = useState('');
    const [sideY, setSideY] = useState('');
    const [height, setHeight] = useState('');

    // Bar Details
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');

    // Spacing Details
    const [s1, setS1] = useState('');
    const [s2, setS2] = useState('');

    // Additional Details
    const [devLength, setDevLength] = useState('');
    const [noOfFooting, setNoOfFooting] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const X = parseFloat(sideX) || 0;
    const Y = parseFloat(sideY) || 0;
    const H = parseFloat(height) || 0; // Usually H is in m or mm in diagram? Image shows 508.0 mm. Footing height.
    const D1_val = parseFloat(d1) || 0;
    const D2_val = parseFloat(d2) || 0;
    const S1_val = parseFloat(s1) || 0;
    const S2_val = parseFloat(s2) || 0;
    const Ld = parseFloat(devLength) || 0;
    const n = parseFloat(noOfFooting) || 0;
    const R = parseFloat(steelRate) || 0;

    // Formulas
    const volResult = (X * Y * H * n) / 1000000000;

    // Weight per meter = d²/162.28
    const w1 = (D1_val * D1_val) / 162.28;
    const w2 = (D2_val * D2_val) / 162.28;

    // Length of one bar = (Dimension - 100 (cover) + 2*Ld) / 1000 (to m)
    const len1 = (X - 100 + 2 * Ld) / 1000;
    const len2 = (Y - 100 + 2 * Ld) / 1000;

    // Number of bars = (Other dimension - 100) / Spacing + 1
    const nos1 = S1_val > 0 ? ((Y - 100) / S1_val) + 1 : 0;
    const nos2 = S2_val > 0 ? ((X - 100) / S2_val) + 1 : 0;

    const d1Weight = len1 * nos1 * w1 * n;
    const d2Weight = len2 * nos2 * w2 * n;
    const totalSteel = d1Weight + d2Weight;
    const totalPrice = totalSteel * R;

    const handleReset = () => {
        setSideX('');
        setSideY('');
        setHeight('');
        setD1('');
        setD2('');
        setS1('');
        setS2('');
        setDevLength('');
        setNoOfFooting('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.footing.sideX', name: t('steel.footing.sideX'), symbol: 'X', value: `${sideX} mm` },
        { labelKey: 'steel.footing.sideY', name: t('steel.footing.sideY'), symbol: 'Y', value: `${sideY} mm` },
        { labelKey: 'steel.footing.height', name: t('steel.footing.height'), symbol: 'H', value: `${height} mm` },
        { labelKey: 'steel.footing.d1', name: t('steel.footing.d1'), symbol: 'D1', value: `${d1} mm` },
        { labelKey: 'steel.footing.d2', name: t('steel.footing.d2'), symbol: 'D2', value: `${d2} mm` },
        { labelKey: 'steel.footing.s1', name: t('steel.footing.s1'), symbol: 'S1', value: `${s1} mm` },
        { labelKey: 'steel.footing.s2', name: t('steel.footing.s2'), symbol: 'S2', value: `${s2} mm` },
        { labelKey: 'steel.footing.devLength', name: t('steel.footing.devLength'), symbol: 'Ld', value: `${devLength} mm` },
        { labelKey: 'steel.footing.noOfFooting', name: t('steel.footing.noOfFooting'), symbol: 'n', value: `${noOfFooting} ${t('history.units.nos')}` },
        { labelKey: 'steel.footing.steelRate', name: t('steel.footing.steelRate'), symbol: 'R', value: `₹ ${steelRate} / ${t('history.units.kg')}` },
    ];

    const dropdownItems = [
        {
            label: t('projectDetails.history'),
            icon: <HistoryIcon className="w-4 h-4" />,
            onClick: () => console.log('History clicked'),
        },
        {
            label: t('history.sharePdf'),
            icon: <Share2 className="w-4 h-4" />,
            onClick: () => console.log('Share clicked'),
        }
    ];



    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.footing.type1')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            onClick={() => console.log('Download')}
                            className="bg-white border-[#E0E0E0] rounded-xl text-secondary !px-2 sm:!px-4 py-2"
                            leftIcon={<Download className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                        {/* <DropdownMenu
                            items={dropdownItems}
                            position="right"
                            className="flex items-center justify-center"
                        /> */}
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    {/* Icon Box - Responsive size */}
                    <div className="flex items-center justify-center ">
                        <img src={footType1} alt="Footing Type 1 Diagram" className="w-full h-full object-contain" />
                    </div>

                    {/* Radio Group */}
                    <div className="flex flex-col gap-4">
                        <Radio
                            label={t('steel.weight.metric')}
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                            className="text-base sm:text-lg"
                        />
                        <Radio
                            label={t('steel.weight.imperial')}
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                            className="text-base sm:text-lg"
                        />
                    </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-4 pt-4">
                    {/* Footing Size Section */}
                    <div className="space-y-2">
                        <h3 className=" font-medium text-primary ml-1">{t('steel.footing.size')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            {/* Side X */}
                            <InputField
                                unit="mm"
                                value={sideX}
                                onChange={(e) => setSideX(e.target.value)}
                                placeholder={t('steel.footing.sideX')}
                            />

                            {/* Side Y */}
                            <InputField
                                unit="mm"
                                value={sideY}
                                onChange={(e) => setSideY(e.target.value)}
                                placeholder={t('steel.footing.sideY')}
                            />

                            {/* Footing Height */}
                            <InputField
                                unit="mm"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder={t('steel.footing.height')}
                            />
                        </div>
                    </div>

                    {/* Bar Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.footing.barDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            {/* D1 */}
                            <InputField
                                unit="mm"
                                value={d1}
                                onChange={(e) => setD1(e.target.value)}
                                placeholder={t('steel.footing.d1')}
                            />

                            {/* D2 */}
                            <InputField
                                unit="mm"
                                value={d2}
                                onChange={(e) => setD2(e.target.value)}
                                placeholder={t('steel.footing.d2')}
                            />
                        </div>
                    </div>

                    {/* Spacing Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.footing.spacingDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            {/* S1 */}
                            <InputField
                                unit="mm"
                                value={s1}
                                onChange={(e) => setS1(e.target.value)}
                                placeholder={t('steel.footing.s1')}
                            />

                            {/* S2 */}
                            <InputField
                                unit="mm"
                                value={s2}
                                onChange={(e) => setS2(e.target.value)}
                                placeholder={t('steel.footing.s2')}
                            />
                        </div>
                    </div>

                    {/* Additional Details Section */}
                    <div className="space-y-3 pt-2">
                        {/* No of Footing */}
                        {/* No of Footing */}
                        <InputField
                            value={noOfFooting}
                            onChange={(e) => setNoOfFooting(e.target.value)}
                            placeholder={t('steel.footing.noOfFooting')}
                            suffix="NOS"
                        />

                        {/* Development Length */}
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={devLength}
                                onChange={(e) => setDevLength(e.target.value)}
                                placeholder={t('steel.footing.devLength')}
                            />

                            <InputField
                                unit="mm"
                                value={devLength}
                                onChange={(e) => setDevLength(e.target.value)}
                                placeholder={t('steel.footing.devLength')}
                            />
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.weight.price')}</h3>
                        <InputField
                            value={steelRate}
                            onChange={(e) => setSteelRate(e.target.value)}
                            placeholder={t('steel.footing.steelRate')}
                            suffix="₹/Kg"
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 sm:gap-6 mt-8">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium text-sm sm:text-base"
                    >
                        {t('steel.weight.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base"
                    >
                        {t('steel.weight.calculate')}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-primary">{t('steel.weight.result')}</h2>
                        {/* <button
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_HISTORY)}
                            className="text-accent font-medium cursor-pointer"
                        >
                            {t('projectDetails.history')}
                        </button> */}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#060C121A] mb-8">
                        <button
                            onClick={() => setUnitType('metric')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'metric' ? 'border-accent text-accent' : 'border-transparent text-secondary'}`}
                        >
                            {t('steel.weight.metric')}
                        </button>
                        <button
                            onClick={() => setUnitType('imperial')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'imperial' ? 'border-accent text-accent' : 'border-transparent text-secondary'}`}
                        >
                            {t('steel.weight.imperial')}
                        </button>
                    </div>

                    {/* Result Table */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    {[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')].map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A] last:border-r-0"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {[
                                    { material: t('steel.footing.volume'), quantity: volResult.toFixed(3), unit: 'm³' },
                                    { material: t('steel.footing.d1'), quantity: d1Weight.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.footing.d2'), quantity: d2Weight.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.weight.totalWeight'), quantity: totalSteel.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.weight.totalPrice'), quantity: totalPrice.toFixed(3), unit: '₹' },
                                ].map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A] last:border-r-0">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('steel.weight.totalCost')}</span>
                            <span className="font-bold text-accent text-xl">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_FOOTING_TYPE1_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: [
                                        { titleKey: 'steel.footing.volume', title: 'Volume', formula: 'XxYxHn/1000000000', value: `${volResult.toFixed(3)} m³` },
                                        { titleKey: 'steel.footing.d1', title: 'D1', formula: '((X-100+2xLd)/1000)x(((Y-100)/S1)+1)x((D1xD1)/162.28)xn', value: `${d1Weight.toFixed(3)} ${t('history.units.kg')}` },
                                        { titleKey: 'steel.footing.d2', title: 'D2', formula: '((Y-100+2xLd)/1000)x(((X-100)/S1)+1)x((D2xD2)/162.28)xn', value: `${d2Weight.toFixed(3)} ${t('history.units.kg')}` },
                                        { titleKey: 'steel.weight.totalWeight', title: 'Total Steel', formula: 'D1 + D2', value: `${totalSteel.toFixed(3)} ${t('history.units.kg')}` },
                                        { titleKey: 'steel.weight.totalPrice', title: 'Total Price', formula: 'Total Steel x R', value: `₹ ${totalPrice.toFixed(2)}` },
                                    ]
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[58px]"
                        >
                            {t('steel.weight.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FootingType1;
