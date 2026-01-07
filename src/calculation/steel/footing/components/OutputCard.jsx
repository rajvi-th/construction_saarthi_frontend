import React from 'react';
import { useTranslation } from 'react-i18next';

const OutputCard = ({ title, formula, value }) => {
    const { t } = useTranslation('calculation');
    return (
        <div className="mb-6 rounded-3xl border border-[#060C120F] bg-white p-6">
            <h3 className="font-medium text-primary border-b border-[#060C120A] pb-3 mb-4">
                {title}
            </h3>
            <div className="space-y-">
                <div className="flex items-center gap-1">
                    <span className="text-primary text-sm ">{t('steel.weight.formula')}:</span>
                    <p className="text-primary font-medium break-all leading-relaxed">
                        {formula}
                    </p>
                </div>
                <div className="pt-1">
                    <p className=" flex items-baseline gap-2">
                        <span className="text-sm text-primary">{title} =</span>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OutputCard;
