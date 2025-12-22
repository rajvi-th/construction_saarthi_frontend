/**
 * Generate Documents Page
 * Shows list of projects with search and status filter
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Dropdown from '../../../components/ui/Dropdown';
import aiPoweredIcon from '../../../assets/icons/aipowered.svg';

// Static projects data with images from Daily Progress Report
const staticProjects = [
  {
    id: '1',
    name: 'Shiv Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: '2',
    name: 'Nirmaan Homes, Surat',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: '3',
    name: 'Shivaay Homes, Rajasthan',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  },
  {
    id: '4',
    name: 'Shree Villa, Surat',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400',
  },
  {
    id: '5',
    name: 'Shiv Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
  },
  {
    id: '6',
    name: 'Nirmaan Homes, Surat',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: '7',
    name: 'Shiv Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    budget: '₹1.2Cr',
    balance: '₹23.5L',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
];

export default function GenerateDocuments() {
  const { t } = useTranslation('documents');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const statusOptions = [
    { value: 'all', label: t('all') },
    { value: 'completed', label: t('completed') },
    { value: 'inProgress', label: t('inProgress') },
  ];

  const handleProjectClick = (projectId) => {
    navigate(getRoute(ROUTES_FLAT.DOCUMENTS_PROJECT_DOCUMENTS, { projectId }));
  };

  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({ ...prev, [projectId]: true }));
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    return staticProjects.filter((project) => {
      const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.address?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto relative">
      <PageHeader
        title={t('generateDocuments')}
        onBack={() => navigate(-1)}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 md:gap-4">
          <SearchBar
            placeholder={t('searchProjects')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 lg:w-[300px] lg:flex-none sm:min-w-0"
          />
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t('status')}
            className="w-full sm:w-36 md:w-40 flex-shrink-0"
          />
        </div>
      </PageHeader>

      {/* AI Powered Badge - Fixed on right side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 block">
        <img src={aiPoweredIcon} alt="AI Powered" className="h-9 cursor-pointer" />
      </div>

      {/* Projects List */}
      <div>
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-sm sm:text-base text-secondary">
              {t('noProjectsFound')}
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredProjects.map((project) => {
              const hasImageError = imageErrors[project.id];
              const imageSrc = project.image;
              const showImage = imageSrc && !hasImageError;

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer shadow-md"
                >
                  {/* Project Image - Same as Daily Progress Report */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {showImage ? (
                      <img
                        src={imageSrc}
                        alt={project.name}
                        onError={() => handleImageError(project.id)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F3F4F6] text-xs text-[#060C1280]">
                        {t('noImage')}
                      </div>
                    )}
                  </div>

                {/* Project Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mb-2 sm:mb-7 line-clamp-1">
                    {project.address}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-secondary">
                      {t('budget')}: <span className="font-medium text-primary">{project.budget}</span>
                    </span>
                    <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                    <span className="text-secondary">
                      {t('balance')}: <span className="font-medium text-primary">{project.balance}</span>
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
