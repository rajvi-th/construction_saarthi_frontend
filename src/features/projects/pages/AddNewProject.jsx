/**
 * Add New Project Page
 * Multi-step style layout for creating a project (UI only for now)
 * Uses shared UI + form components and translations from `projects` namespace.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AddProjectSteps,
  SiteOverviewFormSection,
  ProjectSpecificationsFormSection,
  UploadDocumentsSection,
} from '../components';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import {
  useBuilders,
  useConstructionTypes,
  useContractTypes,
  useCreateProject,
} from '../hooks';
import { PROJECT_ROUTES } from '../constants';
import PageHeader from '../../../components/layout/PageHeader';

function AddNewProject() {
  const { t } = useTranslation('projects');
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();

  // Check if we're in edit mode by checking if the pathname includes '/edit'
  const isEditMode = location.pathname.includes('/edit');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteName: '',
      address: '',
      builderName: '',
      projectStatus: 'upcoming',
      totalArea: '',
      perSqFtRate: '',
      noOfFloors: '',
      constructionType: '',
      contractType: '',
      estimatedBudget: '',
      projectDescription: '',
    },
  });

  const [currentStep] = useState(1); // For future step navigation if needed
  const [startDate, setStartDate] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [areaUnit, setAreaUnit] = useState('sqft'); // 'sqft' | 'meter'
  const [profilePhoto, setProfilePhoto] = useState(null);
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

  const { createProject: createProjectHook, isSubmitting } = useCreateProject(selectedWorkspace);

  const projectStatus = watch('projectStatus', 'upcoming');
  const builderName = watch('builderName', '');
  const constructionType = watch('constructionType', '');
  const contractType = watch('contractType', '');

  const steps = [
    {
      id: 1,
      title: t('addNewProject.steps.siteOverview'),
    },
    {
      id: 2,
      title: t('addNewProject.steps.projectSpecifications'),
    },
    {
      id: 3,
      title: t('addNewProject.steps.uploadDocuments'),
    },
  ];

  const onSubmit = async (data) => {
    try {
      await createProjectHook({
        siteName: data.siteName,
        address: data.address || '',
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
        projectDescription: data.projectDescription || '',
        projectStatus: data.projectStatus || 'pending',
        profilePhoto: profilePhoto,
        photos: uploadedFiles.photos,
        videos: uploadedFiles.videos,
        documents: uploadedFiles.documents,
      });

      // Navigate to projects list
      navigate(PROJECT_ROUTES.PROJECTS);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error creating project:', error);
    }
  };

  const handleStatusChange = (value) => {
    setValue('projectStatus', value, { shouldValidate: true });
  };

  const handleBuilderNameChange = (value) => {
    setValue('builderName', value, { shouldValidate: true });
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
      console.error('Error creating builder:', error);
    }
  };

  const handleConstructionTypeChange = (value) => {
    setValue('constructionType', value, { shouldValidate: true });
  };

  const handleContractTypeChange = (value) => {
    setValue('contractType', value, { shouldValidate: true });
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
      console.error('Error creating construction type:', error);
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
      console.error('Error creating contract type:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={isEditMode ? t('actions.editProject') : t('addNewProject.title')}
          // showBackButton={false}   // since your original code had no back button
          className="py-4 mb-2"
        />


        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Left: Steps Sidebar */}
          <AddProjectSteps steps={steps} currentStep={currentStep} />

          {/* Right: Form Content */}
          <section className="flex-1 space-y-5">
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
            />

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
            />

            <UploadDocumentsSection
              t={t}
              onFilesChange={setUploadedFiles}
            />
          </section>
        </form>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="px-6"
            onClick={() => {
              // TODO: Handle cancel - navigate back or reset form
            }}
          >
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="px-6"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('addNewProject.form.creating') : t('addNewProject.form.createProject')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddNewProject;
