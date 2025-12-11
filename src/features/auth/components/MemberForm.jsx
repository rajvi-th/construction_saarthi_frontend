import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import Dropdown from '../../../components/ui/Dropdown';
import { getWorkspaceRoles } from '../api';
import { showError } from '../../../utils/toast';

export default function MemberForm({
    initialData = null,
    onSubmit,
    onCancel,
    isLoading = false,
}) {
    const { t } = useTranslation();
    
    // Parse phone number and country code from initial data
    const parsePhoneData = () => {
        // Prefer raw phone_number from backend; fallback to formatted phone
        const phoneValue = initialData?.phone_number || initialData?.phone || '';
        if (!phoneValue) return { phone: '', countryCode: '+91' };
        
        const parts = phoneValue.toString().split(' ');
        if (parts.length > 1) {
            return {
                phone: parts.slice(1).join(' ').replace(/\s/g, ''),
                countryCode: parts[0]
            };
        }
        // Handle phone number without country code
        return { phone: phoneValue.toString().replace(/\s/g, ''), countryCode: initialData?.country_code || '+91' };
    };

    const { phone: initialPhone, countryCode: initialCountryCode } = parsePhoneData();
    
    const [name, setName] = useState(initialData?.name || initialData?.full_name || '');
    const [phone, setPhone] = useState(initialPhone);
    const [countryCode, setCountryCode] = useState(initialCountryCode);

    // Dynamic roles from backend
    const [roleOptions, setRoleOptions] = useState([]);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Fetch roles from /workspace/role
    useEffect(() => {
        let isMounted = true;

        const fetchRoles = async () => {
            try {
                setIsRoleLoading(true);
                const response = await getWorkspaceRoles();
                const rawRoles = Array.isArray(response)
                    ? response
                    : response?.role || response?.data || response?.roles || [];

                const options = (rawRoles || []).map((role) => ({
                    value: Number(role.id ?? role.roleId),
                    label: role.name || role.role_name || role.role || String(role.id),
                    _raw: role,
                })).filter(opt => !!opt.value && !!opt.label);

                if (!isMounted) return;

                setRoleOptions(options);

                // Pre-select role in edit mode
                if (initialData && !selectedRole) {
                    let nextSelected = null;

                    if (initialData.roleId) {
                        nextSelected = Number(initialData.roleId);
                    } else if (initialData.role) {
                        const target = String(initialData.role).toLowerCase().trim();
                        const match = options.find((opt) =>
                            opt.label.toLowerCase().trim() === target ||
                            String(opt._raw?.name || '').toLowerCase().trim() === target ||
                            String(opt._raw?.key || '').toLowerCase().trim() === target
                        );
                        if (match) {
                            nextSelected = match.value;
                        }
                    }

                    if (nextSelected) {
                        setSelectedRole(nextSelected);
                    }
                }
            } catch (error) {
                console.error('Error fetching workspace roles:', error);
                showError(t('errors.rolesLoadFailed', { defaultValue: 'Failed to load roles. Please try again.' }));
            } finally {
                if (isMounted) {
                    setIsRoleLoading(false);
                }
            }
        };

        fetchRoles();

        return () => {
            isMounted = false;
        };
    }, [initialData, t, selectedRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !selectedRole) return;

        // Remove spaces from phone number
        const phoneNumber = phone.trim().replace(/\s/g, '');

        const memberData = {
            name: name.trim(),
            phone: `${countryCode} ${phoneNumber}`,
            phone_number: phoneNumber,
            country_code: countryCode,
            roleId: selectedRole,
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
                        placeholder={
                            isRoleLoading
                                ? t('loading', { defaultValue: 'Loading...' })
                                : t('createWorkspace.addNewMember.selectRole', {
                                    ns: 'auth',
                                    defaultValue: 'Select member role',
                                  })
                        }
                        disabled={isRoleLoading || roleOptions.length === 0}
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

