/**
 * Add New Project Page
 * Multi-step style layout for creating a project (UI only for now)
 * Uses shared UI + form components and translations from `projects` namespace.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import {
  AddProjectSteps,
  SiteOverviewFormSection,
  ProjectSpecificationsFormSection,
  UploadDocumentsSection,
} from '../components';
import Button from '../../../components/ui/Button';
import { 
  getAllBuilders, 
  createBuilder, 
  startProject, 
  uploadMedia, 
  createProject,
  getAllConstructionTypes,
  createConstructionType,
  getAllContractTypes,
  createContractType,
} from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PROJECT_ROUTES } from '../constants';

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
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [isLoadingConstructionTypes, setIsLoadingConstructionTypes] = useState(false);
  const [contractTypes, setContractTypes] = useState([]);
  const [isLoadingContractTypes, setIsLoadingContractTypes] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    photos: [],
    videos: [],
    documents: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectStatus = watch('projectStatus', 'upcoming');
  const builderName = watch('builderName', '');
  const constructionType = watch('constructionType', '');
  const contractType = watch('contractType', '');

  // Fetch builders on component mount
  useEffect(() => {
    const fetchBuilders = async () => {
      if (!selectedWorkspace) {
        return;
      }
      
      try {
        setIsLoadingBuilders(true);
        const buildersData = await getAllBuilders(selectedWorkspace);
        
        // Transform builders to dropdown options format
        // API returns { builders: [{ id, full_name }] }
        const builderOptions = buildersData.map((builder) => ({
          value: builder.id?.toString() || builder.builderId?.toString() || builder._id?.toString(),
          label: builder.full_name || builder.name || builder.builderName || '',
        })).filter(builder => builder.label); // Filter out empty names
        
        setBuilders(builderOptions);
      } catch (error) {
        console.error('Error fetching builders:', error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load builders';
        showError(errorMessage);
      } finally {
        setIsLoadingBuilders(false);
      }
    };

    fetchBuilders();
  }, [selectedWorkspace]);

  // Fetch construction types on component mount
  useEffect(() => {
    const fetchConstructionTypes = async () => {
      if (!selectedWorkspace) {
        return;
      }
      
      try {
        setIsLoadingConstructionTypes(true);
        const constructionTypesData = await getAllConstructionTypes(selectedWorkspace);
        
        console.log('Construction types data:', constructionTypesData);
        
        // Transform to dropdown options format
        const constructionTypeOptions = constructionTypesData.map((type) => ({
          value: type.id?.toString() || type.constructionTypeId?.toString() || type._id?.toString(),
          label: type.name || type.constructionTypeName || '',
        })).filter(type => type.label); // Filter out empty names
        
        console.log('Construction type options:', constructionTypeOptions);
        
        setConstructionTypes(constructionTypeOptions);
      } catch (error) {
        console.error('Error fetching construction types:', error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load construction types';
        showError(errorMessage);
      } finally {
        setIsLoadingConstructionTypes(false);
      }
    };

    fetchConstructionTypes();
  }, [selectedWorkspace]);

  // Fetch contract types on component mount
  useEffect(() => {
    const fetchContractTypes = async () => {
      if (!selectedWorkspace) {
        return;
      }
      
      try {
        setIsLoadingContractTypes(true);
        const contractTypesData = await getAllContractTypes(selectedWorkspace);
        
        // Transform to dropdown options format
        const contractTypeOptions = contractTypesData.map((type) => ({
          value: type.id?.toString() || type.contractTypeId?.toString() || type._id?.toString(),
          label: type.name || type.contractTypeName || '',
        })).filter(type => type.label); // Filter out empty names
        
        setContractTypes(contractTypeOptions);
      } catch (error) {
        console.error('Error fetching contract types:', error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load contract types';
        showError(errorMessage);
      } finally {
        setIsLoadingContractTypes(false);
      }
    };

    fetchContractTypes();
  }, [selectedWorkspace]);

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
    if (!selectedWorkspace) {
      showError('Workspace not selected');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Start project to get projectKey
      const startResponse = await startProject(selectedWorkspace);
      const projectKey = startResponse?.projectKey;
      
      if (!projectKey) {
        throw new Error('Failed to get project key');
      }

      // Step 2: Upload media files if any
      const mediaFiles = {};
      // Add profile photo if selected
      if (profilePhoto) {
        mediaFiles.profilePhoto = [profilePhoto];
      }
      // Add other photos if any
      if (uploadedFiles.photos.length > 0) {
        mediaFiles.media = uploadedFiles.photos.map(f => f.file);
      }
      if (uploadedFiles.videos.length > 0) {
        mediaFiles.video = uploadedFiles.videos.map(f => f.file);
      }
      if (uploadedFiles.documents.length > 0) {
        // If media already exists, merge documents
        if (mediaFiles.media) {
          mediaFiles.media = [...mediaFiles.media, ...uploadedFiles.documents.map(f => f.file)];
        } else {
          mediaFiles.media = uploadedFiles.documents.map(f => f.file);
        }
      }

      if (Object.keys(mediaFiles).length > 0) {
        await uploadMedia(projectKey, mediaFiles);
      }

      // Step 3: Create project with all details
      const projectDetails = {
        address: data.address || '',
        builderId: data.builderName || null,
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
        endDate: completionDate ? new Date(completionDate).toISOString().split('T')[0] : null,
        totalArea: data.totalArea || null,
        gaugeTypeId: areaUnit === 'meter' ? '2' : '1', // Assuming 1 = sqft, 2 = meter
        perUnitRate: data.perSqFtRate ? parseFloat(data.perSqFtRate) : null,
        numberOfFloors: data.noOfFloors ? parseInt(data.noOfFloors) : null,
        constructionTypeId: data.constructionType || null,
        contractTypeId: data.contractType || null,
        estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null,
        description: data.projectDescription || '',
      };

      const projectData = {
        workspaceId: selectedWorkspace,
        name: data.siteName,
        status: data.projectStatus || 'pending',
        details: projectDetails,
      };

      await createProject(projectData);

      showSuccess('Project created successfully');
      
      // Navigate to projects list
      navigate(PROJECT_ROUTES.PROJECTS);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create project';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (value) => {
    setValue('projectStatus', value, { shouldValidate: true });
  };

  const handleBuilderNameChange = (value) => {
    setValue('builderName', value, { shouldValidate: true });
  };

  const handleAddNewBuilder = async (newOption, builderData) => {
    if (!selectedWorkspace) {
      showError('Workspace not selected');
      return;
    }
    
    try {
      // Create builder via API with form data
      const response = await createBuilder({
        full_name: builderData.full_name || newOption.label,
        country_code: builderData.country_code || '+91',
        phone_number: builderData.phone_number || '',
        language: builderData.language || 'en',
        company_Name: builderData.company_Name || '',
        address: builderData.address || '',
        role: 'builder',
        workspace_id: builderData.workspace_id || selectedWorkspace,
      });
      
      // Get the new builder ID from response
      const newBuilderId = response?.id?.toString() || 
                          response?.data?.id?.toString() || 
                          response?.builderId?.toString() ||
                          newOption.value;
      
      // Add to builders list
      const newBuilder = {
        value: newBuilderId,
        label: builderData.full_name || newOption.label,
      };
      
      setBuilders((prev) => [...prev, newBuilder]);
      
      // Select the newly created builder
      handleBuilderNameChange(newBuilderId);
      
      showSuccess('Builder added successfully');
    } catch (error) {
      console.error('Error creating builder:', error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create builder';
      showError(errorMessage);
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
      // Create construction type via API
      const response = await createConstructionType({
        name: data.label,
        requiresFloors: data.requiresFloors !== undefined ? data.requiresFloors : true,
      });
      
      // Get the new construction type ID from response
      const newConstructionTypeId = response?.id?.toString() || 
                                   response?.data?.id?.toString() || 
                                   response?.constructionTypeId?.toString() ||
                                   data.value;
      
      // Add to construction types list
      const newConstructionType = {
        value: newConstructionTypeId,
        label: data.label,
        requiresFloors: data.requiresFloors,
      };
      
      setConstructionTypes((prev) => {
        // Check if it already exists
        const exists = prev.some((type) => type.label.toLowerCase() === data.label.toLowerCase());
        if (exists) {
          return prev;
        }
        return [...prev, newConstructionType];
      });
      
      // Select the newly added option
      handleConstructionTypeChange(newConstructionTypeId);
      
      showSuccess('Construction type added successfully');
    } catch (error) {
      console.error('Error creating construction type:', error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create construction type';
      showError(errorMessage);
    }
  };

  const handleAddNewContractType = async (data) => {
    // data comes from ContractTypeModal with { label, value }
    try {
      // Create contract type via API
      const response = await createContractType({
        name: data.label,
      });
      
      // Get the new contract type ID from response
      const newContractTypeId = response?.id?.toString() || 
                               response?.data?.id?.toString() || 
                               response?.contractTypeId?.toString() ||
                               data.value;
      
      // Add to contract types list
      const newContractType = {
        value: newContractTypeId,
        label: data.label,
      };
      
      setContractTypes((prev) => {
        // Check if it already exists
        const exists = prev.some((type) => type.label.toLowerCase() === data.label.toLowerCase());
        if (exists) {
          return prev;
        }
        return [...prev, newContractType];
      });
      
      // Select the newly added option
      handleContractTypeChange(newContractTypeId);
      
      showSuccess('Contract type added successfully');
    } catch (error) {
      console.error('Error creating contract type:', error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create contract type';
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 py-4 mb-2">
          <h1 className="text-lg sm:text-[22px] font-semibold text-primary">
            {isEditMode ? t('actions.editProject') : t('addNewProject.title')}
          </h1>
        </div>

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
            {isSubmitting ? t('addNewProject.form.creating') || 'Creating...' : t('addNewProject.form.createProject')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddNewProject;
