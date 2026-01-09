/**
 * Add New Project Page
 * Multi-step style layout for creating a project (UI only for now)
 * Uses shared UI + form components and translations from `projects` namespace.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  AddProjectSteps,
  SiteOverviewFormSection,
  ProjectSpecificationsFormSection,
  UploadDocumentsSection,
} from "../components";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../hooks/useAuth";
import {
  useBuilders,
  useConstructionTypes,
  useContractTypes,
  useCreateProject,
  useEditProject,
  useProjectDetails,
} from "../hooks";
import { startProject } from "../api";
import { showError, showSuccess } from "../../../utils/toast";
import { PROJECT_ROUTES } from "../constants";
import PageHeader from "../../../components/layout/PageHeader";
import Loader from "../../../components/ui/Loader";

function AddNewProject() {
  const { t } = useTranslation("projects");
  const location = useLocation();
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { selectedWorkspace } = useAuth();

  // Check if we're in edit mode by checking if the pathname includes '/edit'
  const isEditMode = location.pathname.includes("/edit");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteName: "",
      address: "",
      builderName: "",
      projectStatus: "upcoming",
      totalArea: "",
      perSqFtRate: "",
      noOfFloors: "",
      constructionType: "",
      contractType: "",
      estimatedBudget: "",
      projectDescription: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1); // Step navigation: 1 = Site Overview, 2 = Project Specifications, 3 = Upload Documents
  const [startDate, setStartDate] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [areaUnit, setAreaUnit] = useState("sqft"); // 'sqft' | 'meter'
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null); // For existing profile photo URL in edit mode
  const [uploadedFiles, setUploadedFiles] = useState({
    photos: [],
    videos: [],
    documents: [],
  });

  // Use hooks for data fetching
  const {
    builders,
    isLoadingBuilders,
    createBuilder: createBuilderHook,
  } = useBuilders(selectedWorkspace);

  const {
    constructionTypes,
    isLoadingConstructionTypes,
    createConstructionType: createConstructionTypeHook,
  } = useConstructionTypes(selectedWorkspace);

  const {
    contractTypes,
    isLoadingContractTypes,
    createContractType: createContractTypeHook,
  } = useContractTypes(selectedWorkspace);

  const { createProject: createProjectHook, isSubmitting: isCreating } =
    useCreateProject(selectedWorkspace);

  const { editProject: editProjectHook, isSubmitting: isEditing } =
    useEditProject(selectedWorkspace);

  // Load project data when in edit mode
  const { project: projectData, isLoading: isLoadingProject } = useProjectDetails(
    isEditMode ? projectId : null,
    selectedWorkspace
  );

  const isSubmitting = isCreating || isEditing;

  const [preProjectKey, setPreProjectKey] = useState(null);

  const projectStatus = watch("projectStatus", "upcoming");
  const builderName = watch("builderName", "");
  const constructionType = watch("constructionType", "");
  const contractType = watch("contractType", "");

  const steps = [
    {
      id: 1,
      title: t("addNewProject.steps.siteOverview"),
    },
    {
      id: 2,
      title: t("addNewProject.steps.projectSpecifications"),
    },
    {
      id: 3,
      title: t("addNewProject.steps.uploadDocuments"),
    },
  ];

  // Handle step navigation with validation
  const handleNextStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      // Validate Site Overview fields
      fieldsToValidate = ['siteName', 'address', 'builderName'];
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate Project Specifications fields (optional - can be empty)
      // Just move to next step
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    // Validate all required fields from Step 1 (Site Overview)
    const step1Fields = ['siteName', 'address', 'builderName'];
    const step1Valid = await trigger(step1Fields);

    if (!step1Valid) {
      showError(t('addNewProject.validation.fillSiteOverview') || "Please fill all required fields in Site Overview section");
      return;
    }

    // Validate required fields from Step 2 (Project Specifications)
    const step2Fields = ['totalArea', 'perSqFtRate', 'noOfFloors', 'estimatedBudget'];
    const step2Valid = await trigger(step2Fields);

    if (!step2Valid) {
      showError(t('addNewProject.validation.fillProjectSpecifications') || "Please fill all required fields in Project Specifications section");
      return;
    }

    // Validate dropdown fields
    if (!constructionType) {
      showError(t('addNewProject.validation.constructionTypeRequired') || "Construction type is required");
      return;
    }

    if (!contractType) {
      showError(t('addNewProject.validation.contractTypeRequired') || "Contract type is required");
      return;
    }

    try {
      if (isEditMode && projectId) {
        // Edit mode: Use editProject hook
        // Combine videos and photos into media array for the API
        const mediaFiles = [
          ...(uploadedFiles.videos || []),
          ...(uploadedFiles.photos || []),
        ].filter(file => file instanceof File); // Only include File objects, not URLs

        await editProjectHook(projectId, {
          siteName: data.siteName,
          address: data.address || "",
          builderId: data.builderName || null,
          startDate: startDate,
          endDate: completionDate,
          totalArea: data.totalArea || null,
          areaUnit: areaUnit,
          perSqFtRate: data.perSqFtRate || null,
          noOfFloors: data.noOfFloors || null,
          constructionType: data.constructionType || null,
          contractType: data.contractType || null,
          estimatedBudget: data.estimatedBudget || null,
          projectDescription: data.projectDescription || "",
          projectStatus: data.projectStatus || "pending",
          profilePhoto: profilePhoto,
          media: mediaFiles.length > 0 ? mediaFiles : null,
        });

        // Navigate to projects list
        navigate(PROJECT_ROUTES.PROJECTS);
      } else {
        // Create mode: Use createProject hook
        await createProjectHook({
          siteName: data.siteName,
          address: data.address || "",
          builderId: data.builderName || null,
          startDate: startDate,
          endDate: completionDate,
          totalArea: data.totalArea || null,
          areaUnit: areaUnit,
          perSqFtRate: data.perSqFtRate || null,
          noOfFloors: data.noOfFloors || null,
          constructionType: data.constructionType || null,
          contractType: data.contractType || null,
          estimatedBudget: data.estimatedBudget || null,
          projectDescription: data.projectDescription || "",
          projectStatus: data.projectStatus || "pending",
          profilePhoto: profilePhoto,
          photos: uploadedFiles.photos,
          videos: uploadedFiles.videos,
          documents: uploadedFiles.documents,
          // pass pre-fetched projectKey if available to avoid duplicate start call
          projectKey: preProjectKey,
        });

        // Navigate to projects list
        navigate(PROJECT_ROUTES.PROJECTS);
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error(`Error ${isEditMode ? 'editing' : 'creating'} project:`, error);
    }
  };

  // Populate form fields when project data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && projectData && !isLoadingProject) {
      const originalData = projectData.originalData || {};
      const details = originalData.details || {};

      // Set form values
      setValue("siteName", projectData.name || projectData.site_name || "");
      setValue("address", projectData.address || "");

      // Set builder - need to find builder ID from builders list
      if (originalData.builderId || details.builderId) {
        const builderId = originalData.builderId || details.builderId;
        setValue("builderName", String(builderId));
      }

      // Map status: API uses "pending", "in_progress", "completed" - form uses "upcoming", "in_progress"
      const status = originalData.status || projectData.status || "pending";
      const formStatus = status === "pending" ? "upcoming" : status;
      setValue("projectStatus", formStatus);

      // Set dates
      const startDateStr = originalData.startDate || details.startDate || projectData.start_date;
      if (startDateStr) {
        const start = new Date(startDateStr);
        if (!isNaN(start.getTime())) {
          setStartDate(start);
        }
      }

      const endDateStr = originalData.endDate || details.endDate || projectData.completion_date;
      if (endDateStr) {
        const end = new Date(endDateStr);
        if (!isNaN(end.getTime())) {
          setCompletionDate(end);
        }
      }

      // Set area unit based on gaugeTypeId (1 = sqft, 2 = meter)
      const gaugeTypeId = originalData.gaugeTypeId || details.gaugeTypeId;
      if (gaugeTypeId === 2) {
        setAreaUnit("meter");
      } else {
        setAreaUnit("sqft");
      }

      // Set numeric fields
      const totalArea = originalData.totalArea || details.totalArea;
      if (totalArea !== null && totalArea !== undefined && totalArea !== '') {
        // Convert to string and remove any formatting
        const areaValue = String(totalArea).replace(/\s*sq\.?ft\.?/i, "").replace(/,/g, "").trim();
        if (areaValue) {
          setValue("totalArea", areaValue);
        }
      }

      setValue("perSqFtRate", originalData.perUnitRate || details.perUnitRate || "");
      setValue("noOfFloors", originalData.numberOfFloors || details.numberOfFloors || "");
      setValue("estimatedBudget", originalData.estimatedBudget || details.estimatedBudget || "");
      setValue("projectDescription", originalData.description || details.description || projectData.description || "");

      // Set construction type and contract type IDs
      if (originalData.constructionTypeId || details.constructionTypeId) {
        setValue("constructionType", String(originalData.constructionTypeId || details.constructionTypeId));
      }
      if (originalData.contractTypeId || details.contractTypeId) {
        setValue("contractType", String(originalData.contractTypeId || details.contractTypeId));
      }

      // Set profile photo URL (if exists, it's already uploaded)
      const existingProfilePhotoUrl = projectData.profilePhoto || projectData.profile_photo || projectData.image;
      if (existingProfilePhotoUrl) {
        setProfilePhotoUrl(existingProfilePhotoUrl);
      }

      // Set existing media files from projectData.media array
      const mediaArray = projectData.media || [];
      const existingMedia = {
        photos: [],
        videos: [],
        documents: [],
      };

      mediaArray.forEach((mediaItem) => {
        const typeId = String(mediaItem.typeId || mediaItem.type_id || '');
        const mediaUrl = mediaItem.url || '';
        
        // Map typeId to categories based on backend response
        // typeId "3" = image, "4" = video, "2" = document
        // typeId "1" might be profile photo, but we'll also check for it
        if (typeId === '3' || typeId === '1') {
          // Skip profile photo (typeId 1) - it's handled separately
          if (typeId !== '1') {
            existingMedia.photos.push({
              id: mediaItem.id || `${Date.now()}-${Math.random()}`,
              url: mediaUrl,
              name: mediaItem.name || `Photo ${existingMedia.photos.length + 1}`,
              size: mediaItem.size || 'Unknown',
              uploadDate: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }) : 'Unknown',
              uploadDateTime: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }) : 'Unknown',
              date: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }) : 'Unknown',
              isUploaded: true,
              isExisting: true, // Mark as existing file
            });
          }
        } else if (typeId === '4') {
          existingMedia.videos.push({
            id: mediaItem.id || `${Date.now()}-${Math.random()}`,
            url: mediaUrl,
            thumbnail: mediaUrl, // Use URL as thumbnail for videos
            name: mediaItem.name || `Video ${existingMedia.videos.length + 1}`,
            size: mediaItem.size || 'Unknown',
            uploadDate: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) : 'Unknown',
            uploadDateTime: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Unknown',
            date: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Unknown',
            isUploaded: true,
            isExisting: true, // Mark as existing file
          });
        } else if (typeId === '2') {
          existingMedia.documents.push({
            id: mediaItem.id || `${Date.now()}-${Math.random()}`,
            url: mediaUrl,
            name: mediaItem.name || `Document ${existingMedia.documents.length + 1}`,
            size: mediaItem.size || 'Unknown',
            uploadDate: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) : 'Unknown',
            uploadDateTime: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Unknown',
            date: mediaItem.createdAt ? new Date(mediaItem.createdAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Unknown',
            isUploaded: true,
            isExisting: true, // Mark as existing file
          });
        }
      });

      // Set existing media files
      if (existingMedia.photos.length > 0 || existingMedia.videos.length > 0 || existingMedia.documents.length > 0) {
        setUploadedFiles(existingMedia);
      }
    }
  }, [isEditMode, projectData, isLoadingProject, setValue]);

  // Start a project immediately when the form/page opens (pre-allocate projectKey) - only in create mode
  useEffect(() => {
    if (isEditMode) return; // Skip in edit mode

    let mounted = true;
    const doStart = async () => {
      if (!selectedWorkspace) return;
      try {
        const resp = await startProject(selectedWorkspace);
        const key = resp?.projectKey || resp?.project_key || resp?.key;
        if (key && mounted) {
          setPreProjectKey(key);
          showSuccess("Project initialized");
        }
      } catch (err) {
        console.error("Failed to start project on mount", err);
        showError("Failed to initialize project");
      }
    };

    doStart();

    return () => {
      mounted = false;
    };
  }, [selectedWorkspace, isEditMode]);

  const handleStatusChange = (value) => {
    setValue("projectStatus", value, { shouldValidate: true });
  };

  const handleBuilderNameChange = (value) => {
    setValue("builderName", value, { shouldValidate: true });
  };

  const handleAddNewBuilder = async (newOption, builderData) => {
    try {
      const newBuilder = await createBuilderHook({
        ...builderData,
        label: newOption.label,
        value: newOption.value,
      });

      // Select the newly created builder
      if (newBuilder) {
        handleBuilderNameChange(newBuilder.value);
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error("Error creating builder:", error);
    }
  };

  const handleConstructionTypeChange = (value) => {
    setValue("constructionType", value, { shouldValidate: true });
  };

  const handleContractTypeChange = (value) => {
    setValue("contractType", value, { shouldValidate: true });
  };

  const handleAddNewConstructionType = async (data) => {
    // data comes from ConstructionTypeModal with { label, value, requiresFloors }
    try {
      const newConstructionType = await createConstructionTypeHook(data);

      // Select the newly added option
      if (newConstructionType) {
        handleConstructionTypeChange(newConstructionType.value);
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error("Error creating construction type:", error);
    }
  };

  const handleAddNewContractType = async (data) => {
    // data comes from ContractTypeModal with { label, value }
    try {
      const newContractType = await createContractTypeHook(data);

      // Select the newly added option
      if (newContractType) {
        handleContractTypeChange(newContractType.value);
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error("Error creating contract type:", error);
    }
  };

  // Show loader while loading project data in edit mode
  if (isEditMode && isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={
            isEditMode ? t("actions.editProject") : t("addNewProject.title")
          }
          backTo={PROJECT_ROUTES.PROJECTS}
          className="py-4 mb-2"
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Left: Steps Sidebar */}
          <AddProjectSteps steps={steps} currentStep={currentStep} />

          {/* Right: Form Content - Show all 3 cards */}
          <section className="flex-1 space-y-5">
            {/* Card 1: Site Overview */}
            <SiteOverviewFormSection
              t={t}
              register={register}
              errors={errors}
              startDate={startDate}
              setStartDate={setStartDate}
              completionDate={completionDate}
              setCompletionDate={setCompletionDate}
              projectStatus={projectStatus}
              onStatusChange={handleStatusChange}
              builderName={builderName}
              onBuilderNameChange={handleBuilderNameChange}
              builderOptions={builders}
              isLoadingBuilders={isLoadingBuilders}
              onAddNewBuilder={handleAddNewBuilder}
              workspaceId={selectedWorkspace}
              onProfilePhotoChange={setProfilePhoto}
              projectKey={isEditMode ? projectId : preProjectKey}
              existingProfilePhotoUrl={profilePhotoUrl}
              onSaveAndContinue={handleNextStep}
              onCancel={() => navigate(-1)}
            />

            {/* Card 2: Project Specifications */}
            <ProjectSpecificationsFormSection
              t={t}
              register={register}
              errors={errors}
              areaUnit={areaUnit}
              setAreaUnit={setAreaUnit}
              constructionType={constructionType}
              onConstructionTypeChange={handleConstructionTypeChange}
              constructionTypeOptions={constructionTypes}
              isLoadingConstructionTypes={isLoadingConstructionTypes}
              onAddNewConstructionType={handleAddNewConstructionType}
              contractType={contractType}
              onContractTypeChange={handleContractTypeChange}
              contractTypeOptions={contractTypes}
              isLoadingContractTypes={isLoadingContractTypes}
              onAddNewContractType={handleAddNewContractType}
              onSaveAndContinue={handleNextStep}
              onBack={handlePreviousStep}
              onCancel={() => navigate(-1)}
            />

            {/* Card 3: Upload Documents */}
            <UploadDocumentsSection
              t={t}
              onFilesChange={setUploadedFiles}
              projectKey={isEditMode ? projectId : preProjectKey}
              existingFiles={uploadedFiles}
            />
          </section>
        </form>

        {/* Actions - Show Create Project button at bottom */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="px-6"
            onClick={() => navigate(-1)}
          >
            {t("cancel", { ns: "common" })}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="px-6"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditMode
                ? t("addNewProject.form.updating", { defaultValue: "Updating..." })
                : t("addNewProject.form.creating"))
              : (isEditMode
                ? t("addNewProject.form.updateProject", { defaultValue: "Update Project" })
                : t("addNewProject.form.createProject"))}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddNewProject;
