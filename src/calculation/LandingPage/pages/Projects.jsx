
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';

// Static Data
const PROJECTS_DATA = [
    {
        id: 1,
        name: 'Shiv Residency, Bopal',
        address: '86, Veer Nariman Road, Churchgate, Mumbai',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=200', // Example image
    },
    {
        id: 2,
        name: 'Nirmaan Homes, Surat',
        address: '86, Veer Nariman Road, Churchgate, Mumbai',
        image: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?q=80&w=200',
    },
    {
        id: 3,
        name: 'Shivaay Homes, Rajasthan',
        address: '86, Veer Nariman Road, Churchgate, Mumbai',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200',
    },
    {
        id: 4,
        name: 'Shree Villa, Surat',
        address: '86, Veer Nariman Road, Churchgate, Mumbai',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200',
    },
    {
        id: 5,
        name: 'Shiv Residency, Bopal',
        address: '86, Veer Nariman Road, Churchgate, Mumbai',
        image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=200',
    },
];

export default function Projects() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleProjectClick = (projectId) => {
        navigate(getRoute(ROUTES_FLAT.CALCULATION_PROJECT_DETAILS, { projectId }));
    };

    // Filter projects based on search query
    const filteredProjects = PROJECTS_DATA.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-0 md:py-7">

                {/* Header Section */}
                {/* Header Section */}
                <div className="mb-6">
                    <PageHeader
                        title="Construction Calculator"
                        showBackButton={true}
                        className="mb-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 flex-1 w-full lg:justify-end">
                            <SearchBar
                                placeholder="Search projects"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-auto sm:min-w-[260px]"
                            />

                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-primary hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                            >
                                <ArrowUpDown className="w-4 h-4 text-secondary" />
                                <span>Filter</span>
                            </button>
                        </div>
                    </PageHeader>
                </div>

                {/* Projects List */}
                <div className="flex flex-col gap-4">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => handleProjectClick(project.id)}
                            className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4 cursor-pointer"
                        >
                            {/* Image */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                <img
                                    src={project.image}
                                    alt={project.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] sm:text-base font-bold text-primary mb-1">
                                    {project.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-secondary truncate">
                                    {project.address}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-10 text-secondary">
                            No projects found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
