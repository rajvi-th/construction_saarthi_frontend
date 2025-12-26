/**
 * Past Project Detail Page
 * Shows detailed information about a past project including banner, documents, and gallery
 * Fully responsive and dynamic
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import PageHeader from '../../../components/layout/PageHeader';
import { PAST_PROJECT_ROUTES } from '../constants';
import { getRoute } from '../../../constants/routes';
import pencilIcon from '../../../assets/icons/pencil.svg';
import PastProjectBanner from '../components/PastProjectBanner';
import PastProjectDocumentsGallery from '../components/PastProjectDocumentsGallery';

// Mock data structure - will be replaced with API call
const MOCK_PAST_PROJECT_DATA = {
  '1': {
    id: '1',
    site_name: 'Shivaay Residency, Bopal',
    name: 'Shivaay Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    profile_photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop',
    documents: [
      {
        id: 'doc1',
        name: 'Final_Proposal.pdf',
        url: '#',
        size: '4.7 MB',
        date: '26 Sep 2024 3:20 PM',
        uploadDate: '26 Sep 2024',
      },
      {
        id: 'doc2',
        name: 'Terms_Conditions.pdf',
        url: '#',
        size: '9.5 MB',
        date: '26 Sep 2024 3:20 PM',
        uploadDate: '26 Sep 2024',
      },
    ],
    photos: [
      {
        id: 'photo1',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop',
        name: 'Construction Site 1',
        uploadDate: '26 Sep 2024',
      },
      {
        id: 'photo2',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop',
        name: 'Construction Site 2',
        uploadDate: '26 Sep 2024',
      },
      {
        id: 'photo3',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop',
        name: 'Construction Site 3',
        uploadDate: '26 Sep 2024',
      },
    ],
    videos: [],
  },
};

export default function PastProjectDetail() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Get project from location state or fetch by ID
  const projectFromState = location.state?.project;
  const [project, setProject] = useState(projectFromState);

  useEffect(() => {
    // If no project in state, fetch by ID (mock for now)
    if (!project && id) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockProject = MOCK_PAST_PROJECT_DATA[id] || null;
        setProject(mockProject);
        setIsLoading(false);
      }, 500);
    }
  }, [id, project]);

  const handleBack = () => {
    navigate(PAST_PROJECT_ROUTES.LIST);
  };

  const handleEdit = () => {
    if (!project) return;
    
    // Get project ID (can be id, projectKey, or _id)
    const projectId = project.id || project.projectKey || project._id;
    
    if (!projectId) {
      console.error('Project ID not found');
      return;
    }

    // Navigate to edit page
    navigate(getRoute(PAST_PROJECT_ROUTES.EDIT, { id: projectId }), {
      state: { project },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">Past project not found</p>
          <Button variant="primary" onClick={handleBack}>
            Back to Past Work
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div >
      {/* Header */}

          <div className="max-w-7xl mx-auto">
            <PageHeader
              title={project.site_name || project.name}
            >
              <Button
                size="xs"
                onClick={handleEdit}
                className="!border-accent font-medium !text-accent text-xs sm:!text-sm !bg-[#B02E0C0F] !rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5"
              >
                <img src={pencilIcon} alt="Edit project" className="w-4 h-4 object-contain" />
                Edit Project
              </Button>
            </PageHeader>
          </div>
 

      <div className="max-w-7xl mx-auto">
        {/* Project Banner Section */}
        <div className="mb-6">
          <PastProjectBanner project={project} />
        </div>

        {/* Documents and Gallery Section */}
        <PastProjectDocumentsGallery project={project} />
      </div>
    </div>
  );
}

