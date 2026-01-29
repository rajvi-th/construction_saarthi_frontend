/**
 * SiteOverviewFormSection
 * Top card for Add New Project - Site Overview + profile photo upload
 */

import { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Radio from "../../../components/ui/Radio";
import Dropdown from "../../../components/ui/Dropdown";

import { uploadMedia } from "../api/projectApi";
import { showError, showSuccess } from "../../../utils/toast";

import FormInput from "../../../components/forms/FormInput";

function SiteOverviewFormSection({
  t,
  register,
  errors,
  startDate,
  setStartDate,
  completionDate,
  setCompletionDate,
  projectStatus,
  onStatusChange,
  builderName,
  onBuilderNameChange,
  builderOptions = [],
  isLoadingBuilders = false,
  onAddNewBuilder,
  workspaceId,
  onProfilePhotoChange,
  projectKey,
  existingProfilePhotoUrl,
  onSaveAndContinue,
  onCancel,
}) {
  const fileInputRef = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(existingProfilePhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  // Update preview when existingProfilePhotoUrl changes
  useEffect(() => {
    if (existingProfilePhotoUrl && !profilePhoto) {
      setProfilePhotoPreview(existingProfilePhotoUrl);
    }
  }, [existingProfilePhotoUrl, profilePhoto]);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      // eslint-disable-next-line no-console
      console.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      // eslint-disable-next-line no-console
      console.error("Image size should be less than 5MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(file);
    setProfilePhotoPreview(previewUrl);

    // Notify parent component
    if (onProfilePhotoChange) {
      onProfilePhotoChange(file);
    }

    // If we already have a projectKey (and it's not a projectId in edit mode), upload immediately
    // Check if projectKey is a number (projectId in edit mode) vs string (projectKey in create mode)
    const isEditMode = projectKey && !isNaN(Number(projectKey)) && String(projectKey).length < 10;

    if (projectKey && !isEditMode) {
      // In create mode, upload immediately using projectKey
      (async () => {
        try {
          setIsUploading(true);
          await uploadMedia(projectKey, { profilePhoto: [file] });
          showSuccess("Profile photo uploaded");
        } catch (err) {
          console.error("Failed to upload profile photo", err);
          showError("Failed to upload profile photo");
        } finally {
          setIsUploading(false);
        }
      })();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-7.5">
      <h2 className="text-base sm:text-lg font-semibold text-primary mb-5">
        {t("addNewProject.steps.siteOverview")}
      </h2>

      {/* Upload Project Profile Photo */}
      <div className="flex justify-center mb-6">
        <div className="flex flex-col items-center text-center">
          {/* Circle with photo preview or camera icon */}
          <div className="relative">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black-soft flex items-center justify-center cursor-pointer hover:bg-black-soft/80 transition-colors overflow-hidden"
            >
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Project profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera
                  className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
                  strokeWidth={2.5}
                />
              )}
            </button>
            {/* Camera icon overlay when photo is selected */}
            {profilePhotoPreview && (
              <button
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Title */}
          <p className="mt-3 text-sm sm:text-base font-medium text-primary">
            {t("addNewProject.form.uploadPhoto")}
          </p>

          {/* Supported format */}
          <p className="mt-1 text-xs sm:text-xs text-primary-light">
            {t("addNewProject.form.supportedFormat")}
          </p>
          {isUploading && (
            <p className="mt-1 text-xs sm:text-xs text-primary-light">
              Uploading...
            </p>
          )}
        </div>
      </div>

      {/* Site Overview Fields */}
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label={t("addNewProject.form.siteName")}
          name="siteName"
          placeholder={t("addNewProject.form.siteNamePlaceholder")}
          register={register}
          required
          labelClassName="text-primary font-normal"
          validationRules={{
            required: t("addNewProject.validation.siteNameRequired"),
          }}
          errors={errors}
        />

        <FormInput
          label={t("addNewProject.form.address")}
          name="address"
          placeholder={t("addNewProject.form.addressPlaceholder")}
          register={register}
          required
          labelClassName="text-primary font-normal"
          validationRules={{
            required: t("addNewProject.validation.addressRequired"),
          }}
          errors={errors}
        />

        <div className="mb-4">
          <Dropdown
            label={t("addNewProject.form.builderName")}
            value={builderName}
            onChange={onBuilderNameChange}
            required
            placeholder={
              isLoadingBuilders
                ? t("addNewProject.form.loadingBuilders") ||
                "Loading builders..."
                : t("addNewProject.form.selectBuilder")
            }
            options={builderOptions}
            error={errors.builderName?.message}
            disabled={isLoadingBuilders}
            showSeparator={true}
            onAddNew={onAddNewBuilder}
            addButtonLabel={t("addNewProject.form.addNewBuilder")}
            useBuilderModal={true}
            workspaceId={workspaceId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label={t("addNewProject.form.estStartDate")}
            value={startDate}
            onChange={setStartDate}
            required
            error={errors.startDate?.message}
            placeholder="dd/mm/yyyy"
          />
          <DatePicker
            label={t("addNewProject.form.estCompletionDate")}
            value={completionDate}
            onChange={setCompletionDate}
            placeholder="dd/mm/yyyy"
          />
        </div>

        {/* Project Status */}
        <div className="mt-2">
          <p className="block text-sm font-medium text-primary mb-2">
            {t("addNewProject.form.projectStatus")}
            <span className="text-accent ml-1">*</span>
          </p>
          <div className="flex items-center gap-6">
            <Radio
              name="projectStatus"
              value="upcoming"
              label={t("addNewProject.form.upcoming")}
              checked={projectStatus === "upcoming"}
              onChange={() => onStatusChange("upcoming")}
            />
            <Radio
              name="projectStatus"
              value="in_progress"
              label={t("addNewProject.form.inProgress")}
              checked={projectStatus === "in_progress"}
              onChange={() => onStatusChange("in_progress")}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col md:flex-row justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hidden md:flex px-6"
            onClick={onCancel}
          >
            {t("cancel", { ns: "common" })}
          </Button>
        )}
        {onSaveAndContinue && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full md:w-auto px-6"
            onClick={onSaveAndContinue}
          >
            {t("addNewProject.form.saveAndContinue", { defaultValue: 'Next' })}
          </Button>
        )}
      </div>
    </div>
  );
}

export default SiteOverviewFormSection;
