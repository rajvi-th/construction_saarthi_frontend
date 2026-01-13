import React from 'react';
import { useTranslation } from 'react-i18next';

const OutputCard = ({ output }) => {
    const { t } = useTranslation('calculation');

    // Handle keys if provided, otherwise fallback to direct strings
    const displayTitle = output.titleKey
        ? t(output.titleKey)
        : output.title;

    let displayLabel = output.labelKey
        ? t(output.labelKey)
        : output.label;

    if (displayLabel && output.labelSuffix) {
        displayLabel = `${displayLabel} ${output.labelSuffix}`;
    }

    return (
        <div className="mb-6 rounded-3xl border border-[#060C120F] bg-white md:p-6 p-3">
            <h3 className="font-medium text-primary border-b border-[#060C120A] pb-3 mb-4">
                {displayTitle}
            </h3>
            <div className="space-y-1">
                {/* Formula Row */}
                <div className="flex items-center gap-1">
                    {displayLabel && <span className="text-secondary text-sm md:min-w-[100px]">{displayLabel}</span>}
                    <p className="text-primary text-sm font-medium break-all leading-relaxed">
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
};

const OutputCards = ({ outputs, title }) => {
    return (
        <div className="mt-10 space-y-6 px-4 sm:px-0">
            {title && (
                <h2 className="text-lg font-medium text-primary ml-1 mb-4 text-left">{title}</h2>
            )}
            <div className="grid grid-cols-1 gap-2">
                {outputs.map((output, index) => (
                    <OutputCard
                        key={index}
                        output={output}
                    />
                ))}
            </div>
        </div>
    );
};

export default OutputCards;
