/**
 * Add New Project Page
 * Multi-step style layout for creating a project (UI only for now)
 * Uses shared UI + form components and translations from `projects` namespace.
 */

import { useState, useEffect, useRef } from "react";
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
import { startProject, getProjectPrompt } from "../api";
import { showError, showSuccess } from "../../../utils/toast";
import { PROJECT_ROUTES } from "../constants";
import PageHeader from "../../../components/layout/PageHeader";
import Loader from "../../../components/ui/Loader";
import { getRoute } from "../../../constants/routes";

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
      startDate: null,
    },
  });

  useEffect(() => {
    register("builderName", {
      required: t("addNewProject.validation.selectBuilder") || "Builder name is required",
    });
    register("startDate", {
      required: t("addNewProject.validation.selectStartDate") || "Start date is required",
    });
    register("constructionType", {
      required: t("addNewProject.validation.constructionTypeRequired") || "Construction type is required",
    });
    register("contractType", {
      required: t("addNewProject.validation.contractTypeRequired") || "Contract type is required",
    });
  }, [register, t]);

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
  const isMediaInitialized = useRef(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());

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
      fieldsToValidate = ['siteName', 'address', 'builderName', 'startDate'];
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate Project Specifications fields
      fieldsToValidate = ['estimatedBudget', 'constructionType', 'contractType'];
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    // Validate all required fields from Step 1 (Site Overview)
    const step1Fields = ['siteName', 'address', 'builderName', 'startDate'];
    const step1Valid = await trigger(step1Fields);

    if (!step1Valid) {
      showError(t('addNewProject.validation.fillSiteOverview') || "Please fill all required fields in Site Overview section");
      setCurrentStep(1);
      return;
    }

    // Validate required fields from Step 2 (Project Specifications)
    const step2Fields = ['estimatedBudget', 'constructionType', 'contractType'];
    const step2Valid = await trigger(step2Fields);

    if (!step2Valid) {
      showError(t('addNewProject.validation.fillProjectSpecifications') || "Please fill all required fields in Project Specifications section");
      setCurrentStep(2);
      return;
    }

    try {
      // Convert all media to File objects (re-upload approach required by backend)
      const allMediaItems = [
        ...(uploadedFiles.videos || []),
        ...(uploadedFiles.photos || []),
        ...(uploadedFiles.documents || []),
      ];

      const mediaFiles = await Promise.all(allMediaItems.map(async (item) => {
        // If it's a new file that has a binary File object
        if (item.file instanceof File) return item.file;
        if (item instanceof File) return item;

        // If file is already on server (has URL), fetch and convert to File to re-upload
        // This is necessary because the backend replaces the entire media list
        if (item.url && (item.isExisting || item.isUploaded)) {
          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            // Create a File object from the blob
            const filename = item.name || item.fileName || item.url.split('/').pop() || 'existing_file';
            const file = new File([blob], filename, { type: blob.type || item.type || 'application/octet-stream' });
            return file;
          } catch (error) {
            console.error("Failed to convert existing file to blob used for re-upload:", item.url, error);
            // If we can't convert it, we can try sending the ID as a fallback, 
            // but likely the backend will delete it if it expects Files.
            // Returning the string ID as a last resort.
            return String(item.id);
          }
        }

        return null;
      }));

      const validMediaFiles = mediaFiles.filter(Boolean);

      if (isEditMode && projectId) {
        // Edit mode: Use editProject hook
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
          media: validMediaFiles.length > 0 ? validMediaFiles : null,
        });

        // Navigate to project details
        navigate(getRoute(PROJECT_ROUTES.PROJECT_DETAILS, { slug: projectId }), {
          state: {
            projectName: data.siteName,
            refresh: true // Optional: trigger a refresh if needed
          }
        });
      } else {
        // Create mode: Use createProject hook
        const newProject = await createProjectHook({
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

        // Call background API for construction cost estimation
        if (newProject) {
          const createdId = newProject.id || newProject.projectId || newProject.project_id || preProjectKey;
          if (createdId) {
            getProjectPrompt(createdId).catch(err =>
              console.error("Background prompt call failed:", err)
            );
          }
        }

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
          setValue("startDate", start, { shouldValidate: true });
        }
      }

      const endDateStr = originalData.endDate || details.endDate || projectData.completion_date;
      if (endDateStr) {
        const end = new Date(endDateStr);
        if (!isNaN(end.getTime())) {
          setCompletionDate(end);
          setValue("completionDate", end, { shouldValidate: true });
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
        const typeName = String(mediaItem.typeName || mediaItem.type_name || '').toLowerCase();
        const mediaUrl = mediaItem.url || '';

        // Category matching by ID or Name
        // Include profile photo (typeId 1) in gallery as well if it's in the media array
        const isPhoto = typeId === '3' || typeId === '1' || typeName.includes('photo') || typeName.includes('image');
        const isVideo = typeId === '4' || typeName.includes('video');
        const isDocument = typeId === '2' || typeName.includes('document') || typeName.includes('pdf') || typeName.includes('file');

        const fileData = {
          id: mediaItem.id || String(Date.now() + Math.random()),
          url: mediaUrl,
          name: mediaItem.name || mediaItem.fileName || mediaUrl.split('/').pop() || 'File',
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
          isExisting: true,
        };

        if (isPhoto) {
          existingMedia.photos.push(fileData);
        } else if (isVideo) {
          existingMedia.videos.push({
            ...fileData,
            thumbnail: fileData.url,
          });
        } else if (isDocument) {
          existingMedia.documents.push(fileData);
        }
      });

      // Set existing media files - ONLY DO THIS ONCE
      if (!isMediaInitialized.current) {
        setUploadedFiles(existingMedia);
        isMediaInitialized.current = true;
      }
    }
  }, [isEditMode, projectData, isLoadingProject, setValue]);

  // Start a project immediately when the form/page opens (pre-allocate projectKey)
  useEffect(() => {
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

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setValue("startDate", date, { shouldValidate: true });
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

  // Effect to update location state with project name for breadcrumbs in Edit Mode
  useEffect(() => {
    if (isEditMode && projectData && (projectData.site_name || projectData.name)) {
      const name = projectData.site_name || projectData.name;
      // Only update if the name in state is missing or different to avoid infinite loops
      if (location.state?.projectName !== name) {
        navigate(location.pathname, {
          replace: true,
          state: {
            ...location.state,
            projectName: name
          }
        });
      }
    }
  }, [isEditMode, projectData, location.state, location.pathname, navigate]);

  // Handle Loading & Error States
  if (isLoadingProject || isLoadingBuilders || isLoadingConstructionTypes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
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
          onBack={() => {
            if (isEditMode && projectId) {
              const name = projectData?.site_name || projectData?.name || location.state?.projectName;
              navigate(getRoute(PROJECT_ROUTES.PROJECT_DETAILS, { slug: projectId }), {
                state: { projectName: name }
              });
            } else {
              navigate(PROJECT_ROUTES.PROJECTS);
            }
          }}
          className="py-4 mb-2"
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Left: Steps Sidebar */}
          <AddProjectSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepId) => {
              // Only allow jumping to previous steps or next step if valid
              if (stepId < currentStep) {
                setCurrentStep(stepId);
              } else if (stepId === currentStep + 1) {
                handleNextStep();
              }
            }}
          />

          {/* Right: Form Content - Show step-wise */}
          <section className="flex-1">
            {/* Card 1: Site Overview */}
            {currentStep === 1 && (
              <SiteOverviewFormSection
                t={t}
                register={register}
                errors={errors}
                startDate={startDate}
                setStartDate={handleStartDateChange}
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
                projectKey={preProjectKey || (isEditMode ? projectId : null)}
                existingProfilePhotoUrl={profilePhotoUrl}
                onSaveAndContinue={handleNextStep}
                onCancel={() => navigate(-1)}
              />
            )}

            {/* Card 2: Project Specifications */}
            {currentStep === 2 && (
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
            )}

            {/* Card 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <UploadDocumentsSection
                  t={t}
                  onFilesChange={setUploadedFiles}
                  projectKey={preProjectKey || (isEditMode ? projectId : null)}
                  existingFiles={uploadedFiles}
                />

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
            )}
          </section>
        </form>
      </div>
    </div>
  );
}

export default AddNewProject;
