import React from 'react';
import { useTranslation } from 'react-i18next';

const OutputsTable = ({ outputs, title }) => {
    const { t } = useTranslation('calculation');

    return (
        <div className="mt-10 space-y-6 px-4 sm:px-0">
            {title && (
                <h2 className="text-lg font-medium text-primary ml-1 mb-4">{title}</h2>
            )}
            {outputs.map((output, index) => {
                const displayTitle = output.titleKey ? `${t(output.titleKey)}${output.titleSuffix || ''}` : output.title;
                const displayLabel = output.labelKey ? `${t(output.labelKey)}${output.labelSuffix || ''}` : output.label;
                return (
                    <div key={index} className="mb-6 rounded-3xl border border-[#060C120F] bg-white md:p-6 p-3">
                        <h3 className="font-medium text-primary border-b border-[#060C120A] pb-3 mb-4">
                            {displayTitle}
                        </h3>
                        <div className="space-y-1">
                            {/* Formula Row */}
                            <div className="flex items-center gap-1">
                                {displayLabel && <span className="text-secondary text-sm md:min-w-[100px]">{displayLabel}</span>}
                                <p className="text-primary md:text-base text-sm font-medium break-all leading-relaxed">
                                    {output.formula}
                                </p>
                            </div>
                            {/* Value Row */}
                            <div className="pt-1">
                                <p className="flex items-baseline gap-2">
                                    {displayLabel && <span className="text-sm text-secondary min-w-0 md:min-w-[100px]">{displayLabel}</span>}
                                    {output.value}
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
