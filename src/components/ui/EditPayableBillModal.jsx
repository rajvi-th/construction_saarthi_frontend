/**
 * EditPayableBillModal Component
 * Modal for editing an existing payable bill
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import DatePicker from './DatePicker';
import Textarea from './Textarea';
import Radio from './Radio';
import AddVendorModal from '../../features/siteInventory/components/AddVendorModal';

export default function EditPayableBillModal({
  isOpen,
  onClose,
  onUpdate,
  payableBill,
  vendors = [],
  onAddVendor,
}) {
  const { t } = useTranslation('finance');

  const [formData, setFormData] = useState({
    title: '',
    vendorName: '',
    amount: '',
    dueDate: new Date(),
    status: 'pending',
    description: '',
  });

  const [errors, setErrors] = useState({});

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    if (isOpen && payableBill) {
      setFormData({
        title: payableBill.title || '',
        vendorName: payableBill.vendorName || '',
        amount: payableBill.amount
          ? payableBill.amount.replace(/[₹,]/g, '')
          : '',
        dueDate: payableBill.dueDate
          ? new Date(payableBill.dueDate)
          : new Date(),
        status: payableBill.status || 'pending',
        description: payableBill.description || '',
      });

      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, payableBill]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('billTitleRequired', {
        defaultValue: 'Bill title is required',
      });
    }

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = t('vendorNameRequired', {
        defaultValue: 'Vendor name is required',
      });
    }

    const amountValue = parseFloat(formData.amount || 0);
    if (!amountValue || amountValue <= 0) {
      newErrors.amount = t('amountRequired', {
        defaultValue: 'Amount is required',
      });
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
    onClose();
  };

  const handleVendorAdded = (vendorData) => {
    const vendorName = vendorData.name;

    if (onAddVendor && !vendors.includes(vendorName)) {
      onAddVendor(vendorName);
    }

    handleChange('vendorName', vendorName);
  };

  if (!isOpen || !payableBill) return null;

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor,
    label: vendor,
  }));

  /* ---------------- JSX ---------------- */
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h3 className="text-lg sm:text-xl font-medium text-primary">
              {t('editPayableBill', { defaultValue: 'Edit Payable Bill' })}
            </h3>
          </div>

          {/* Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-4">
            {/* Title */}
            <Input
              label={t('billTitle', { defaultValue: 'Title' })}
              placeholder={t('enterBillTitle', {
                defaultValue: 'Enter Bill Title',
              })}
              value={formData.title}
              error={errors.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            {/* Vendor Dropdown (Add New Vendor INSIDE dropdown) */}
            <Dropdown
              label={t('toVendorName', { defaultValue: 'To (Vendor Name)' })}
              value={formData.vendorName}
              options={vendorOptions}
              placeholder={t('selectVendor', { defaultValue: 'Select Vendor' })}
              error={errors.vendorName}
              searchable
              showSeparator
              searchPlaceholder={t('searchVendor', {
                defaultValue: 'Search vendor',
              })}
              onChange={(value) => handleChange('vendorName', value)}
              addButtonLabel={t('addNewVendor', {
                defaultValue: 'Add New Vendor',
              })}
              customModal={AddVendorModal}
              customModalProps={{ t }}
              onAddNew={async (vendorData) => {
                handleVendorAdded(vendorData);
              }}
            />

            {/* Amount */}
            <Input
              label={t('amount', { defaultValue: 'Amount' })}
              placeholder="₹.00"
              value={formData.amount}
              error={errors.amount}
              onChange={(e) =>
                handleChange(
                  'amount',
                  e.target.value.replace(/[^\d.]/g, '')
                )
              }
              required
            />

            {/* Due Date */}
            <DatePicker
              label={t('dueDate', { defaultValue: 'Due Date' })}
              value={formData.dueDate}
              onChange={(date) => handleChange('dueDate', date)}
            />

            {/* Status */}
            <div>
              <label className="block text-sm font-normal mb-2">
                {t('status', { defaultValue: 'Status' })}
                <span className="text-accent">*</span>
              </label>
              <div className="flex items-center gap-6">
                <Radio
                  name="status"
                  label={t('pending', { defaultValue: 'Pending' })}
                  checked={formData.status === 'pending'}
                  onChange={() =>
                    handleChange('status', 'pending')
                  }
                />
                <Radio
                  name="status"
                  label={t('paid', { defaultValue: 'Paid' })}
                  checked={formData.status === 'paid'}
                  onChange={() =>
                    handleChange('status', 'paid')
                  }
                />
              </div>
            </div>

            {/* Description */}
            <Textarea
              label={t('description', { defaultValue: 'Description' })}
              placeholder={t('writeDescription', {
                defaultValue: 'Write description',
              })}
              rows={4}
              value={formData.description}
              onChange={(e) =>
                handleChange('description', e.target.value)
              }
            />
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 sticky bottom-0 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              className="w-full sm:w-auto"
            >
              {t('update', { defaultValue: 'Update' })}
            </Button>
          </div>
        </div>
      </div>

    </>
  );
}
