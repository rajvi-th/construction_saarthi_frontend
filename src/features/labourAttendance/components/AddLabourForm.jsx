import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import AddItemModal from '../../../components/ui/AddItemModal';
import Radio from '../../../components/ui/Radio';
import PhoneInput from '../../../components/ui/PhoneInput';
import DatePicker from '../../../components/ui/DatePicker';
import FileUpload from '../../../components/ui/FileUpload';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../auth/store';
import { useCategories } from '../hooks/useCategories';
import { useProjectsAll } from '../hooks/useProjectsAll';
import { useShiftTypes } from '../hooks/useShiftTypes';
import { showError } from '../../../utils/toast';

export default function AddLabourForm({
  projectId,
  projectName,
  mode = 'add', // 'add' | 'edit'
  initialData = null,
  isLoading = false,
  onCancel,
  onSubmit,
}) {
  const { t } = useTranslation('labourAttendance');
  const { selectedWorkspace } = useAuth();
  const profilePhotoInputRef = useRef(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const [labourName, setLabourName] = useState('');
  const [category, setCategory] = useState('');
  const [assignProject, setAssignProject] = useState(projectId || '');
  const [shiftTypeId, setShiftTypeId] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [defaultDailyWage, setDefaultDailyWage] = useState('');
  const [joinDate, setJoinDate] = useState(null);
  const [aadharCardFiles, setAadharCardFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [aadharCardPreviews, setAadharCardPreviews] = useState([]);
  const [insurancePreviews, setInsurancePreviews] = useState([]);
  const [profilePhotoRemoved, setProfilePhotoRemoved] = useState(false);
  const [aadharCardRemoved, setAadharCardRemoved] = useState(false);
  const [insuranceRemoved, setInsuranceRemoved] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState({});

  const { categories, addNewCategory } = useCategories(selectedWorkspace);
  const { projects } = useProjectsAll(selectedWorkspace);
  const { shiftTypes } = useShiftTypes();

  const sortedShiftTypes = useMemo(() => {
    const list = Array.isArray(shiftTypes) ? shiftTypes : [];
    return [...list].sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));
  }, [shiftTypes]);

  useEffect(() => {
    if (!initialData || isLoading) return;

    setLabourName(initialData.labourName || initialData.name || '');
    setCategory(String(initialData.category || initialData.category_id || initialData.categoryId || ''));
    setAssignProject(String(initialData.assignProject || initialData.projectId || initialData.project_id || projectId || ''));
    setShiftTypeId(String(initialData.shiftTypeId || initialData.shift_type_id || initialData.shiftType || ''));

    // Contact: accept either {countryCode, contactNumber} or "+91 99999 99999"
    if (initialData.countryCode) setCountryCode(initialData.countryCode);
    if (initialData.contactNumber) {
      const cn = String(initialData.contactNumber).trim();
      const match = cn.match(/^(\+\d+)\s+(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setContactNumber(match[2]);
      } else {
        setContactNumber(cn);
      }
    } else if (initialData.phoneNumber) {
      setContactNumber(initialData.phoneNumber);
    }

    setAadharNumber(initialData.aadharNumber || initialData.aadhar_number || '');
    setDefaultDailyWage(
      initialData.defaultDailyWage !== undefined && initialData.defaultDailyWage !== null
        ? String(initialData.defaultDailyWage)
        : ''
    );
    setJoinDate(initialData.joinDate || initialData.join_date || null);
    setProfilePhotoPreview(initialData.profilePhotoPreview || initialData.profilePhoto || '');
    setProfilePhotoFile(null);
    setProfilePhotoRemoved(false);
    setAadharCardRemoved(false);
    setInsuranceRemoved(false);

    // Set existing photos in edit mode
    if (mode === 'edit' && initialData) {
      if (initialData.aadharCardPhoto) {
        setAadharCardPreviews([{ file: null, previewUrl: initialData.aadharCardPhoto, name: 'Aadhar Card' }]);
        setAadharCardFiles([]);
      } else {
        setAadharCardPreviews([]);
        setAadharCardFiles([]);
      }
      if (initialData.insurancePhoto) {
        setInsurancePreviews([{ file: null, previewUrl: initialData.insurancePhoto, name: 'Insurance Photo' }]);
        setInsuranceFiles([]);
      } else {
        setInsurancePreviews([]);
        setInsuranceFiles([]);
      }
    }
  }, [initialData, projectId, mode, isLoading]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list.map((c) => ({
      label: c?.name || c?.label || '',
      value: String(c?.id || c?.category_id || c?.value || ''),
    })).filter((o) => o.value);
  }, [categories]);

  const projectOptions = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return list.map((p) => ({
      label: p?.name || p?.project_name || p?.label || '',
      value: String(p?.id || p?.project_id || p?.value || ''),
    })).filter((o) => o.value);
  }, [projects]);

  useEffect(() => {
    if (!assignProject && projectId) setAssignProject(String(projectId));
  }, [assignProject, projectId]);

  useEffect(() => {
    if (!shiftTypeId && sortedShiftTypes.length > 0) {
      setShiftTypeId(String(sortedShiftTypes[0]?.id || ''));
    }
  }, [shiftTypeId, sortedShiftTypes]);

  const handleProfilePhotoChange = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfilePhotoPreview(url);
    setProfilePhotoFile(file);
    setProfilePhotoRemoved(false);
  };

  const handleAadharCardFileSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setAadharCardFiles([file]);
      setAadharCardPreviews([{ file, previewUrl, name: file.name }]);
      setAadharCardRemoved(false);
    }
  };

  const handleInsuranceFileSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setInsuranceFiles([file]);
      setInsurancePreviews([{ file, previewUrl, name: file.name }]);
      setInsuranceRemoved(false);
    }
  };

  const handleRemoveAadharCard = () => {
    if (aadharCardPreviews.length > 0) {
      // Only revoke if it's a blob URL (created from file), not a regular URL
      const previewUrl = aadharCardPreviews[0].previewUrl;
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }
    setAadharCardFiles([]);
    setAadharCardPreviews([]);
    setAadharCardRemoved(true);
  };

  const handleRemoveInsurance = () => {
    if (insurancePreviews.length > 0) {
      // Only revoke if it's a blob URL (created from file), not a regular URL
      const previewUrl = insurancePreviews[0].previewUrl;
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }
    setInsuranceFiles([]);
    setInsurancePreviews([]);
    setInsuranceRemoved(true);
  };

  // Cleanup preview URLs on unmount (only blob URLs)
  useEffect(() => {
    return () => {
      aadharCardPreviews.forEach((preview) => {
        if (preview.previewUrl && preview.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
      insurancePreviews.forEach((preview) => {
        if (preview.previewUrl && preview.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, [aadharCardPreviews, insurancePreviews]);

  const avatarStyle = {
    borderColor: 'var(--color-lightGray)',
    backgroundColor: 'rgba(6,12,18,0.04)',
    color: 'var(--color-primary)',
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate labour name
    if (!labourName || !labourName.trim()) {
      newErrors.labourName = t('addLabourForm.enterName') || 'Please enter labour name';
    }

    // Validate category
    if (!category || !category.trim()) {
      newErrors.category = t('addLabourForm.selectCategory') || 'Please select category';
    }

    // Validate project
    if (!assignProject || !assignProject.trim()) {
      newErrors.assignProject = t('addLabourForm.selectProject') || 'Please select project';
    }

    // Validate shift type
    if (!shiftTypeId || !shiftTypeId.trim()) {
      newErrors.shiftTypeId = 'Please select shift type';
    }

    // Validate contact number
    if (!contactNumber || !contactNumber.trim()) {
      newErrors.contactNumber = 'Please enter contact number';
    }

    // Validate default daily wage
    if (!defaultDailyWage || !defaultDailyWage.trim()) {
      newErrors.defaultDailyWage = 'Please enter default daily wage';
    } else {
      const wageValue = Number(defaultDailyWage);
      if (isNaN(wageValue) || wageValue <= 0) {
        newErrors.defaultDailyWage = 'Please enter a valid daily wage';
      }
    }

    // Validate join date
    if (!joinDate) {
      newErrors.joinDate = t('addLabourForm.selectDate') || 'Please select join date';
    }

    // Validate files only in add mode
    if (mode === 'add') {
      if (aadharCardFiles.length === 0 && aadharCardPreviews.length === 0) {
        newErrors.aadharCardPhoto = 'Please upload Aadhar card photo';
      }
      if (insuranceFiles.length === 0 && insurancePreviews.length === 0) {
        newErrors.insurancePhoto = 'Please upload insurance photo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showError(t('common.validationError', { defaultValue: 'Please fill all required fields' }));
      return;
    }

    onSubmit?.({
      id: initialData?.id,
      labourName,
      categoryId: category,
      assignProject,
      shiftTypeId,
      contactNumber: `${countryCode} ${contactNumber}`.trim(),
      countryCode,
      rawContactNumber: contactNumber,
      aadharNumber,
      defaultDailyWage,
      joinDate,
      aadharCardFiles,
      insuranceFiles,
      profilePhotoPreview,
      profilePhotoFile,
      profilePhotoRemoved,
      aadharCardRemoved,
      insuranceRemoved,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-primary-light">{t('common.loading', { ns: 'labourAttendance' })}</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Center profile photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-semibold text-xl sm:text-2xl md:text-3xl border-2 flex-shrink-0 overflow-hidden"
            style={avatarStyle}
          >
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Labour"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-secondary"> </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleProfilePhotoChange}
            className="absolute bottom-0 right-0 sm:right-1 bg-accent rounded-full p-1.5 sm:p-2 border-2 border-white shadow-md hover:bg-[#9F290A] transition-colors cursor-pointer"
            aria-label="Change photo"
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 sm:space-y-5">
        <Input
          label={t('addLabourForm.labourName')}
          required
          placeholder={t('addLabourForm.enterName')}
          value={labourName}
          onChange={(e) => {
            setLabourName(e.target.value);
            if (errors.labourName) {
              setErrors((prev) => ({ ...prev, labourName: '' }));
            }
          }}
          error={errors.labourName}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <Dropdown
            label={t('addLabourForm.category')}
            required
            placeholder={t('addLabourForm.selectCategory')}
            value={category}
            onChange={(value) => {
              setCategory(value);
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: '' }));
              }
            }}
            options={categoryOptions}
            error={errors.category}
            showSeparator
            addButtonLabel={t('addLabourForm.addNewCategory')}
            customModal={AddItemModal}
            customModalProps={{
              title: t('addLabourForm.addCategoryTitle'),
              placeholder: t('addLabourForm.addCategoryPlaceholder'),
              label: t('addLabourForm.category'),
            }}
            onAddNew={async (label) => {
              const safeLabel = String(label || '').trim();
              if (!safeLabel) return;
              const created = await addNewCategory?.(safeLabel);
              const createdId = created?.id || created?.category_id || created?.data?.id;
              if (createdId) {
                setCategory(String(createdId));
              }
            }}
          />
          <Dropdown
            label={t('addLabourForm.assignToProject')}
            required
            placeholder={t('addLabourForm.selectProject')}
            value={assignProject}
            onChange={(value) => {
              setAssignProject(value);
              if (errors.assignProject) {
                setErrors((prev) => ({ ...prev, assignProject: '' }));
              }
            }}
            options={projectOptions}
            error={errors.assignProject}
          />
        </div>

        <div>
          <label className="block font-medium text-primary mb-2">
            {t('addLabourForm.shiftType')}
            <span className="text-accent ml-1">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-6">
            {sortedShiftTypes.map((s) => (
              <Radio
                key={s.id}
                name="shiftTypeId"
                label={s.name}
                value={String(s.id)}
                checked={String(shiftTypeId) === String(s.id)}
                onChange={() => {
                  setShiftTypeId(String(s.id));
                  if (errors.shiftTypeId) {
                    setErrors((prev) => ({ ...prev, shiftTypeId: '' }));
                  }
                }}
              />
            ))}
          </div>
          {errors.shiftTypeId && (
            <p className="text-sm text-accent mt-1">{errors.shiftTypeId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhoneInput
            label={t('addLabourForm.contactNumber')}
            required
            value={contactNumber}
            onChange={(e) => {
              setContactNumber(e.target.value);
              if (errors.contactNumber) {
                setErrors((prev) => ({ ...prev, contactNumber: '' }));
              }
            }}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            error={errors.contactNumber}
          />
          <Input
            label={t('addLabourForm.labourAadharNumber')}
            placeholder={t('addLabourForm.enterNumber')}
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('addLabourForm.defaultDailyWage')}
            required
            placeholder="₹ 00"
            type="number"
            value={defaultDailyWage}
            onChange={(e) => {
              setDefaultDailyWage(e.target.value);
              if (errors.defaultDailyWage) {
                setErrors((prev) => ({ ...prev, defaultDailyWage: '' }));
              }
            }}
            error={errors.defaultDailyWage}
          />
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('addLabourForm.joinDate')}<span className="text-accent ml-1">*</span>
            </label>
            <DatePicker
              value={joinDate}
              onChange={(value) => {
                setJoinDate(value);
                if (errors.joinDate) {
                  setErrors((prev) => ({ ...prev, joinDate: '' }));
                }
              }}
              placeholder={t('addLabourForm.selectDate')}
              className="w-full"
              error={errors.joinDate}
            />
          </div>
        </div>

        {/* Photos: in Edit mode show both in one line (2 columns), in Add mode keep stacked */}
        {mode === 'edit' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-primary mb-2">
                {t('addLabourForm.aadharCardPhoto')}<span className="text-accent ml-1">*</span>
              </label>
              <FileUpload
                title="Upload Photo"
                supportedFormats="JPG, PNG"
                maxSize={10}
                maxSizeUnit="MB"
                supportedFormatLabel="Supported Format:"
                onFileSelect={handleAadharCardFileSelect}
              />
              {aadharCardPreviews.length > 0 && (
                <div className="mt-3 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-lightGray">
                    <img
                      src={aadharCardPreviews[0].previewUrl}
                      alt={aadharCardPreviews[0].name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAadharCard}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondary truncate max-w-[128px]">{aadharCardPreviews[0].name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('addLabourForm.insurancePhoto')}<span className="text-accent ml-1">*</span>
              </label>
              <FileUpload
                title="Upload Photo"
                supportedFormats="JPG, PNG"
                maxSize={10}
                maxSizeUnit="MB"
                supportedFormatLabel="Supported Format:"
                onFileSelect={handleInsuranceFileSelect}
              />
              {insurancePreviews.length > 0 && (
                <div className="mt-3 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-lightGray">
                    <img
                      src={insurancePreviews[0].previewUrl}
                      alt={insurancePreviews[0].name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveInsurance}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondary truncate max-w-[128px]">{insurancePreviews[0].name}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('addLabourForm.aadharCardPhoto')}<span className="text-accent ml-1">*</span>
              </label>
              <FileUpload
                title="Upload Photo"
                supportedFormats="JPG, PNG"
                maxSize={10}
                maxSizeUnit="MB"
                supportedFormatLabel="Supported Format:"
                onFileSelect={handleAadharCardFileSelect}
              />
              {aadharCardPreviews.length > 0 && (
                <div className="mt-3 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-lightGray">
                    <img
                      src={aadharCardPreviews[0].previewUrl}
                      alt={aadharCardPreviews[0].name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAadharCard}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondary truncate max-w-[128px]">{aadharCardPreviews[0].name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('addLabourForm.insurancePhoto')}<span className="text-accent ml-1">*</span>
              </label>
              <FileUpload
                title="Upload Photo"
                supportedFormats="JPG, PNG"
                maxSize={10}
                maxSizeUnit="MB"
                supportedFormatLabel="Supported Format:"
                onFileSelect={handleInsuranceFileSelect}
              />
              {insurancePreviews.length > 0 && (
                <div className="mt-3 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-lightGray">
                    <img
                      src={insurancePreviews[0].previewUrl}
                      alt={insurancePreviews[0].name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveInsurance}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondary truncate max-w-[128px]">{insurancePreviews[0].name}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {mode === 'edit' ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </div>
    </div>
  );
}


