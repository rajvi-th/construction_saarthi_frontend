import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import Dropdown from '../../../components/ui/Dropdown';

export default function MemberForm({
    initialData = null,
    onSubmit,
    onCancel,
    isLoading = false,
}) {
    const { t } = useTranslation();
    
    // Parse phone number and country code from initial data
    const parsePhoneData = () => {
        if (!initialData?.phone) return { phone: '', countryCode: '+91' };
        const parts = initialData.phone.split(' ');
        if (parts.length > 1) {
            return {
                phone: parts.slice(1).join(' '),
                countryCode: parts[0]
            };
        }
        return { phone: initialData.phone, countryCode: '+91' };
    };

    const { phone: initialPhone, countryCode: initialCountryCode } = parsePhoneData();
    
    const [name, setName] = useState(initialData?.name || '');
    const [phone, setPhone] = useState(initialPhone);
    const [countryCode, setCountryCode] = useState(initialCountryCode);
    const [selectedRole, setSelectedRole] = useState(initialData?.role || null);

    // Role options
    const roleOptions = [
        { value: 'contractorPartner', label: t('createWorkspace.addNewMember.roles.contractorPartner', { ns: 'auth', defaultValue: 'Contractor Partner' }) },
        { value: 'supervisorEngineer', label: t('createWorkspace.addNewMember.roles.supervisorEngineer', { ns: 'auth', defaultValue: 'Supervisor/Engineer' }) },
        { value: 'builder', label: t('createWorkspace.addNewMember.roles.builder', { ns: 'auth', defaultValue: 'Builder' }) },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !selectedRole) return;

        const memberData = {
            name: name.trim(),
            phone: `${countryCode} ${phone.trim()}`,
            role: selectedRole,
        };

        onSubmit?.(memberData);
    };

    const handleRemoveRole = () => {
        setSelectedRole(null);
    };

    const selectedRoleOption = roleOptions.find(opt => opt.value === selectedRole);
    const isEditMode = !!initialData;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Name Field */}
            <div>
                <Input
                    label={t('createWorkspace.addNewMember.name', { ns: 'auth', defaultValue: 'Name' })}
                    placeholder={t('createWorkspace.addNewMember.enterName', { ns: 'auth', defaultValue: 'Enter name' })}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            {/* Contact Number Field */}
            <div>
                <PhoneInput
                    label={t('createWorkspace.addNewMember.contactNumber', { ns: 'auth', defaultValue: 'Contact Number' })}
                    placeholder="000 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    required
                />
            </div>

            {/* Permission Field */}
            <div>
                <label className="block text-sm font-medium text-primary mb-2">
                    {t('createWorkspace.addNewMember.permission', { ns: 'auth', defaultValue: 'Permission' })}
                    <span className="text-accent ml-1">*</span>
                </label>
                
                {/* Selected Role Tag */}
                {selectedRole && selectedRoleOption && (
                    <div className="mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                            <span className="text-sm font-medium text-primary">
                                {selectedRoleOption.label}
                            </span>
                            <button
                                type="button"
                                onClick={handleRemoveRole}
                                className="p-0.5 rounded transition-colors cursor-pointer"
                                aria-label={t('createWorkspace.addNewMember.removeRole', { ns: 'auth', defaultValue: 'Remove role' })}
                            >
                                <X className="w-3 h-3 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Dropdown */}
                {(!selectedRole || !selectedRoleOption) && (
                    <Dropdown
                        options={roleOptions}
                        value={selectedRole}
                        onChange={setSelectedRole}
                        placeholder={t('createWorkspace.addNewMember.selectRole', { ns: 'auth', defaultValue: 'Select member role' })}
                        label=""
                    />
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="w-full px-6 py-3"
                    disabled={isLoading}
                >
                    {t('createWorkspace.addNewMember.cancel', { ns: 'auth', defaultValue: 'Cancel' })}
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full px-6 py-3"
                    disabled={!name.trim() || !phone.trim() || !selectedRole || isLoading}
                >
                    {isLoading
                        ? t('loading', { defaultValue: 'Loading...' })
                        : isEditMode
                            ? t('createWorkspace.addNewMember.updateMember', { ns: 'auth', defaultValue: 'Update Member' })
                            : t('createWorkspace.addNewMember.addMember', { ns: 'auth', defaultValue: 'Add Member' })
                    }
                </Button>
            </div>
        </form>
    );
}

