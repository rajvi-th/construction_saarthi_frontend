import React from 'react';
import { useTranslation } from 'react-i18next';

const OutputsTable = ({ outputs, title }) => {
    const { t } = useTranslation('calculation');

    return (
        <div className="mt-10 space-y-6">
            {title && (
                <h2 className="text-lg font-medium text-primary ml-1 mb-4">{title}</h2>
            )}
            {outputs.map((output, index) => {
                const displayTitle = output.titleKey ? `${t(output.titleKey)}${output.titleSuffix || ''}` : output.title;
                const displayLabel = output.labelKey ? `${t(output.labelKey)}${output.labelSuffix || ''}` : `${output.label || ''}${output.labelSuffix || ''}`;
                return (
                    <div key={index} className="mb-6 rounded-2xl border border-[#060C120F] bg-white md:p-6 p-3">
                        <h3 className="font-medium text-primary border-b border-[#060C120A] pb-3 mb-4 text-base sm:text-lg">
                            {displayTitle}
                        </h3>
                        <div className="space-y-3">
                            {/* Formula Row */}
                            {output.formula && (
                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                                    {displayLabel && <span className="text-secondary text-sm md:min-w-[120px]">{displayLabel}</span>}
                                    <p className="text-primary md:text-base text-sm font-medium break-all leading-relaxed">
                                        {output.formula}
                                    </p>
                                </div>
                            )}
                            {/* Value Row */}
                            <div className="pt-1">
                                <p className="flex items-baseline gap-2">
                                    {displayLabel && output.formula && <span className="text-sm text-secondary min-w-[120px]">{displayLabel}</span>}
                                    <span className="text-primary font-medium">{output.value} {output.unitKey ? t(output.unitKey) : (output.unit || '')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OutputsTable;
