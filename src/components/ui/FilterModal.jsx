/**
 * Filter Modal Component
 * Advanced filter drawer that slides in from right to left
 * Includes dropdowns, checkboxes, radio buttons, and date pickers
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Dropdown from './Dropdown';
import Checkbox from './Checkbox';
import Radio from './Radio';
import Button from './Button';
import DatePicker from './DatePicker';
import sortVerticalIcon from '../../assets/icons/Sort Vertical.svg';

export default function FilterModal({
    filters = [],
    onApply,
    onReset,
    placeholder = 'Filter',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({});

    // Initialize filter values
    useEffect(() => {
        const initialValues = {};
        filters.forEach((filter) => {
            if (filter.type === 'checkbox') {
                initialValues[filter.id] = filter.defaultValue || [];
            } else if (filter.type === 'radio') {
                initialValues[filter.id] = filter.defaultValue || null;
            } else if (filter.type === 'date') {
                initialValues[filter.id] = filter.defaultValue || null;
            } else {
                initialValues[filter.id] = filter.defaultValue || '';
            }
        });
        setFilterValues(initialValues);
    }, [filters]);

    const handleDateChange = (filterId, date) => {
        setFilterValues((prev) => ({
            ...prev,
            [filterId]: date,
        }));
    };

    const handleDropdownChange = (filterId, value) => {
        setFilterValues((prev) => ({
            ...prev,
            [filterId]: value,
        }));
    };

    const handleCheckboxChange = (filterId, optionValue) => {
        setFilterValues((prev) => {
            const currentValues = prev[filterId] || [];
            const isChecked = currentValues.includes(optionValue);
            return {
                ...prev,
                [filterId]: isChecked
                    ? currentValues.filter((v) => v !== optionValue)
                    : [...currentValues, optionValue],
            };
        });
    };

    const handleRadioChange = (filterId, value) => {
        setFilterValues((prev) => ({
            ...prev,
            [filterId]: value,
        }));
    };

    const handleApply = () => {
        onApply?.(filterValues);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetValues = {};
        filters.forEach((filter) => {
            if (filter.type === 'checkbox') {
                resetValues[filter.id] = [];
            } else if (filter.type === 'radio') {
                resetValues[filter.id] = null;
            } else if (filter.type === 'date') {
                resetValues[filter.id] = null;
            } else {
                resetValues[filter.id] = '';
            }
        });
        setFilterValues(resetValues);
        onReset?.();
    };

    return (
        <div>
            {/* Filter Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm flex items-center gap-2 cursor-pointer font-light ${className}`}
            >
                <img
                    src={sortVerticalIcon}
                    alt="Filter"
                    className="w-6 h-6 flex-shrink-0"
                />
                <span className="text-primary font-light">{placeholder}</span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Filter Drawer - Slides from right to left */}
            <div
                className={`
          fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 flex items-center justify-between">
                    <h2 className="text-[22px] font-bold text-primary">Filter</h2>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={24} className="text-primary" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="p-6 pt-0 space-y-6 pb-24">
                    {filters.map((filter) => (
                        <div key={filter.id}>
                            {/* Date Filter */}
                            {filter.type === 'date' && (
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        {filter.label}
                                        {filter.required && <span className="text-accent ml-1">*</span>}
                                    </label>
                                    <DatePicker
                                        value={filterValues[filter.id] || null}
                                        onChange={(date) => handleDateChange(filter.id, date)}
                                        placeholder={filter.placeholder || 'dd/mm/yyyy'}
                                        error={filter.error}
                                        className="w-full"
                                        {...filter.props}
                                    />
                                </div>
                            )}

                            {/* Dropdown Filter */}
                            {filter.type === 'dropdown' && (
                                <div>
                                    <label className="block font-medium text-primary mb-1">
                                        {filter.label}
                                        {filter.required && <span className="text-accent ml-1">*</span>}
                                    </label>
                                    <Dropdown
                                        options={filter.options || []}
                                        value={filterValues[filter.id] || ''}
                                        onChange={(value) => handleDropdownChange(filter.id, value)}
                                        placeholder={filter.placeholder || 'Select option'}
                                        className="w-full"
                                        searchable={filter.searchable}
                                        searchPlaceholder={filter.searchPlaceholder}
                                        showSeparator={filter.showSeparator}
                                        addButtonLabel={filter.addButtonLabel}
                                        onAddNew={filter.onAddNew}
                                        customModal={filter.customModal}
                                        customModalProps={filter.customModalProps}
                                        {...filter.dropdownProps}
                                    />
                                </div>
                            )}

                            {/* Radio Filter */}
                            {filter.type === 'radio' && (
                                <div>
                                    <label className="block font-medium text-primary mb-3">
                                        {filter.label}
                                    </label>
                                    <div className="space-y-4">
                                        {filter.options?.map((option) => (
                                            <Radio
                                                key={option.value}
                                                name={filter.id}
                                                label={option.label}
                                                value={option.value}
                                                checked={filterValues[filter.id] === option.value}
                                                onChange={() => handleRadioChange(filter.id, option.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Checkbox Filter */}
                            {filter.type === 'checkbox' && (
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-3">
                                        {filter.label}
                                    </label>
                                    <div className="space-y-4">
                                        {filter.options?.map((option) => (
                                            <Checkbox
                                                key={option.value}
                                                label={option.label}
                                                checked={(filterValues[filter.id] || []).includes(option.value)}
                                                onChange={() => handleCheckboxChange(filter.id, option.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer - Fixed at bottom of screen */}
                <div className="fixed bottom-0 right-0 w-full max-w-lg bg-white p-4 flex justify-end gap-3 z-[70] border-t border-gray-100">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}
