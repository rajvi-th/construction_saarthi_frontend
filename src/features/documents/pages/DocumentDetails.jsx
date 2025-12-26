/**
 * Document Details Page
 * Shows details of a specific document (e.g., Material Quotation, Proposal)
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import { X } from 'lucide-react';
import downloadIcon from '../../../assets/icons/Download Minimalistic.svg';
import aiPoweredIcon from '../../../assets/icons/aipowered.svg';
import jsPDF from 'jspdf';
import { showSuccess, showError } from '../../../utils/toast';

// Static project names mapping
const staticProjectNames = {
  '1': 'Shiv Residency, Bopal',
  '2': 'Nirmaan Homes, Surat',
  '3': 'Shivaay Homes, Rajasthan',
  '4': 'Shree Villa, Surat',
  '5': 'Shiv Residency, Bopal',
  '6': 'Nirmaan Homes, Surat',
  '7': 'Shiv Residency, Bopal',
};

// Static document data - title will be translated in component
const staticDocumentData = {
  proposal: {
    titleKey: 'details.materialQuotation',
    clientName: 'Abhishek Roy',
    contractorName: 'Shubhash rao',
    projectLocation: '86, Veer Nariman Road, Churchgate, Mumbai',
    scopeOfWork: 'Ex temporibus sed nemo. Perferendis ea iure dolor. Dolor odio et exercitationem veritatis enim exercitationem totam ab. Cumque id aperiam repellat. Impedit ea officiis velit nam. Aut quasi quam autem doloribus reiciendis est quia. Libero aperiam aut deserunt odio amet cumque consequatur repellendus voluptatem. Consequatur repudiandae illo esse. Aut mollitia qui labore eveniet illo. Odio voluptates aut voluptatem deleniti aut consectetur quis.',
    timeline: 'June 2025 - December 2026',
    paymentTerms: 'Cash',
    termsAndConditions: 'Ex temporibus sed nemo. Perferendis ea iure dolor. Dolor odio et exercitationem veritatis enim exercitationem totam ab. Cumque id aperiam repellat. Impedit ea officiis velit nam. Aut quasi quam autem doloribus reiciendis est quia. Libero aperiam aut deserunt odio amet cumque consequatur repellendus voluptatem. Consequatur repudiandae illo esse. Aut mollitia qui labore eveniet illo. Odio voluptates aut voluptatem deleniti aut consectetur quis.',
    materialEstimate: 'Ex temporibus sed nemo. Perferendis ea iure dolor. Dolor odio et exercitationem veritatis enim exercitationem totam ab. Cumque id aperiam repellat. Impedit ea officiis velit nam.',
    labourEstimate: 'Ex temporibus sed nemo. Perferendis ea iure dolor. Dolor odio et exercitationem veritatis enim exercitationem totam ab. Cumque id aperiam repellat. Impedit ea officiis velit nam. Aut quasi quam autem doloribus reiciendis est quia. Libero aperiam aut deserunt odio amet cumque consequatur repellendus voluptatem. Consequatur repudiandae illo esse. Aut mollitia qui labore eveniet illo. Odio voluptates aut voluptatem deleniti aut consectetur quis.',
  },
};

// Static past projects
const staticPastProjects = [
  {
    id: '1',
    name: 'Shivaay Residency, Bopal',
    address: 'A2b/86a, Mig Flat, Paschim Vihar, Delhi, 110087',
    phone: '01125272722',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: '2',
    name: 'Nirmaan Homes',
    address: 'Mohan Centre Bldg, V P Road, Nr Railway Crossing, Vile Parle (west) Mumbai, Maharashtra, 400056',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
];

export default function DocumentDetails() {
  const { t } = useTranslation('documents');
  const navigate = useNavigate();
  const { projectId, documentId } = useParams();
  
  const projectName = staticProjectNames[projectId] || t('project');
  const documentData = staticDocumentData[documentId] || staticDocumentData.proposal;
  const document = {
    ...documentData,
    title: t(documentData.titleKey),
  };

  const handleDownload = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
          doc.setFont(undefined, 'bold');
        } else {
          doc.setFont(undefined, 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Add Title
      addText(document.title || 'Material Quotation', 20, true, [0, 0, 0]);
      yPosition += 10;

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Client Name
      addText(t('details.clientName'), 14, true);
      addText(document.clientName || '', 11, false);
      yPosition += 8;

      // Contractor Name
      addText(t('details.contractorName'), 14, true);
      addText(document.contractorName || '', 11, false);
      yPosition += 8;

      // Project Location
      addText(t('details.projectLocation'), 14, true);
      addText(document.projectLocation || '', 11, false);
      yPosition += 8;

      // Scope of Work
      addText(t('details.scopeOfWork'), 14, true);
      addText(document.scopeOfWork || '', 11, false);
      yPosition += 8;

      // Timeline
      addText(t('details.timeline'), 14, true);
      addText(document.timeline || '', 11, false);
      yPosition += 8;

      // Payment Terms
      addText(t('details.paymentTerms'), 14, true);
      addText(document.paymentTerms || '', 11, false);
      yPosition += 8;

      // Terms and Conditions
      addText(t('details.termsAndConditions'), 14, true);
      addText(document.termsAndConditions || '', 11, false);
      yPosition += 8;

      // Material Estimate
      addText(t('details.materialEstimate'), 14, true);
      addText(document.materialEstimate || '', 11, false);
      yPosition += 8;

      // Labour Estimate
      addText(t('details.labourEstimate'), 14, true);
      addText(document.labourEstimate || '', 11, false);
      yPosition += 8;

      // Past Projects
      if (staticPastProjects && staticPastProjects.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }
        addText(t('details.pastProjects'), 14, true);
        staticPastProjects.forEach((project) => {
          const projectText = `${project.name || ''}${project.address ? ` - ${project.address}` : ''}${project.phone ? ` - ${project.phone}` : ''}`;
          addText(projectText, 11, false);
        });
      }

      // Generate filename
      const fileName = `${document.title || 'Material_Quotation'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      doc.save(fileName);
      
      showSuccess(t('details.downloadProposal') + ' downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to download PDF');
    }
  };

  const handleRemoveProject = (projectId) => {
    // Handle remove project
    console.log('Remove project:', projectId);
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <PageHeader
        title={document.title}
        onBack={() => navigate(getRoute(ROUTES_FLAT.DOCUMENTS_PROJECT_DOCUMENTS, { projectId }))}
      >
        <div className="w-full flex justify-center md:w-auto md:justify-start">
          <button
            onClick={handleDownload}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-secondary rounded-4xl cursor-pointer whitespace-nowrap"
          >
            <img src={downloadIcon} alt="Download" className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('details.downloadProposal')}
            </span>
          </button>
        </div>
      </PageHeader>

      {/* AI Powered Badge - Fixed on right side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 block">
        <img src={aiPoweredIcon} alt="AI Powered" className="h-9 cursor-pointer" />
      </div>

      <div className="mt-6 space-y-4">
        {/* Client Name */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.clientName')}
          </h3>
          <p className="text-sm text-secondary pb-4 border-b border-gray-200">{document.clientName}</p>
        </div>

        {/* Contractor Name */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.contractorName')}
          </h3>
          <p className="text-sm text-secondary pb-4 border-b border-gray-200">{document.contractorName}</p>
        </div>

        {/* Project Location */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.projectLocation')}
          </h3>
          <p className="text-sm text-secondary pb-4 border-b border-gray-200">{document.projectLocation}</p>
        </div>

        {/* Scope of Work */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.scopeOfWork')}
          </h3>
          <p className="text-sm text-secondary whitespace-pre-line pb-4 border-b border-gray-200">{document.scopeOfWork}</p>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.timeline')}
          </h3>
          <p className="text-sm text-secondary pb-4 border-b border-gray-200">{document.timeline}</p>
        </div>

        {/* Payment Terms */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.paymentTerms')}
          </h3>
          <p className="text-sm text-secondary pb-4 border-b border-gray-200">{document.paymentTerms}</p>
        </div>

        {/* Terms and Conditions */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.termsAndConditions')}
          </h3>
          <p className="text-sm text-secondary whitespace-pre-line pb-4 border-b border-gray-200">{document.termsAndConditions}</p>
        </div>

        {/* Material Estimate */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.materialEstimate')}
          </h3>
          <p className="text-sm text-secondary whitespace-pre-line pb-4 border-b border-gray-200">{document.materialEstimate}</p>
        </div>

        {/* Labour Estimate */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">
            {t('details.labourEstimate')}
          </h3>
          <p className="text-sm text-secondary whitespace-pre-line pb-4 border-b border-gray-200">{document.labourEstimate}</p>
        </div>

        {/* Past Projects */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">
            {t('details.pastProjects')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staticPastProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md  p-4 relative"
              >
                <button
                  onClick={() => handleRemoveProject(project.id)}
                  className="absolute top-2 right-2 p-1 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-secondary" />
                </button>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-md font-medium text-primary mb-1">
                      {project.name}
                    </h4>
                    <p className="text-sm text-secondary mb-1 line-clamp-2">
                      {project.address}
                    </p>
                    {project.phone && (
                      <p className="text-sm text-secondary">{project.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

