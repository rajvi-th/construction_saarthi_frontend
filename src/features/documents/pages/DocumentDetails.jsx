/**
 * Document Details Page
 * Shows details of a specific document (e.g., Construction Cost estimation)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import downloadIcon from '../../../assets/icons/DownloadMinimalistic.svg';
import aiPoweredIcon from '../../../assets/icons/aipowered.svg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { showSuccess, showError } from '../../../utils/toast';
import { getProjectDocumentDetails, getProjectDetails } from '../../projects/api';
import { useAuth } from '../../auth/store';
import { getDocumentSignatures, uploadDocumentSignature } from '../api/signatureApi';
import SignatureCanvas from 'react-signature-canvas';
import { Pencil } from 'lucide-react';


export default function DocumentDetails() {
  const { t } = useTranslation('documents');
  const navigate = useNavigate();
  const { projectId, documentId } = useParams();
  const { state } = useLocation();
  const { selectedWorkspace } = useAuth();

  const [document, setDocument] = useState(null);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const projectName = state?.projectName || project?.name || project?.details?.name || t('project', { defaultValue: 'Project' });

  //signature
  // ================= SIGNATURE SETUP =================
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [activeSigner, setActiveSigner] = useState(null); // 'contractor' | 'client'

  const [signatures, setSignatures] = useState({
    contractor: null,
    client: null
  });

  const [isSignatureLoading, setIsSignatureLoading] = useState(false);

  const sigCanvasRef = useRef(null);
  const documentRef = useRef(null);

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const handleSaveSignature = async () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty() && activeSigner) {
      const dataURL = sigCanvasRef.current.toDataURL('image/png');

      try {
        setIsSignatureLoading(true);

        // Upload signature to API
        await uploadDocumentSignature({
          projectId,
          documentId,
          promptId: document?.prompt_id || document?.id, // Get promptId from document
          signatureType: activeSigner,
          signatureImage: dataURL
        });

        // Update local state
        setSignatures(prev => ({
          ...prev,
          [activeSigner]: dataURL
        }));

        setIsSignatureOpen(false);
        setActiveSigner(null);

        showSuccess('Signature saved successfully');
      } catch (error) {
        console.error('Error saving signature:', error);
        showError('Failed to save signature');
      } finally {
        setIsSignatureLoading(false);
      }
    } else {
      showError('Please add a signature first');
    }
  };
  // ==================================================




  useEffect(() => {
    const fetchDetails = async () => {
      if (!projectId || !documentId) return;

      try {
        setIsLoading(true);

        // Fetch document details and project details (if name not in state)
        const promises = [getProjectDocumentDetails(projectId, documentId)];

        if (!state?.projectName) {
          promises.push(getProjectDetails(projectId, selectedWorkspace).catch(() => null));
        }

        const [docData, projectData] = await Promise.all(promises);

        setDocument(docData);
        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        console.error('Error fetching document details:', error);
        showError(t('error.fetchDetails', { defaultValue: 'Failed to load document details' }));
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSignatures = async () => {
      if (!projectId || !documentId) return;

      try {
        const signaturesData = await getDocumentSignatures(projectId, documentId);

        if (signaturesData?.success && signaturesData?.signatures) {
          const signaturesMap = {
            contractor: null,
            client: null
          };

          signaturesData.signatures.forEach(sig => {
            if (sig.signature_key === 'contractor_signature') {
              signaturesMap.contractor = sig.signature_image_url;
            } else if (sig.signature_key === 'client_signature') {
              signaturesMap.client = sig.signature_image_url;
            }
          });

          setSignatures(signaturesMap);
        }
      } catch (error) {
        console.error('Error fetching signatures:', error);
        // Don't show error for signatures as it's not critical
      }
    };

    fetchDetails();
    fetchSignatures();
  }, [projectId, documentId, t]);

  const handleDownload = () => {
    // We use window.print() because it handles modern CSS like 'oklch' 
    // and complex layouts perfectly, whereas html2canvas does not.
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-secondary">{t('details.notFound', { defaultValue: 'Document not found' })}</p>
        <button onClick={() => navigate(-1)} className="text-accent font-medium underline">
          {t('common.goBack', { ns: 'common', defaultValue: 'Go Back' })}
        </button>
      </div>
    );
  }

  const calculation = document.generated_content?.calculation;
  const aiInsights = document.generated_content?.ai_insights;

  // Formatting helpers
  const formatKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (key, value) => {
    if (typeof value === 'number') {
      if (key.includes('cost') || key.includes('inr') || key.includes('rate') || key.includes('budget') || key.includes('total')) {
        return `₹${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  // Custom Table Row Component
  const TableRow = ({ label, value, isBold = false, variant = 'default' }) => (
    <div className={`flex border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors ${variant === 'summary' ? 'bg-gray-50/30' : ''}`}>
      <div className={`w-1/3 p-3 text-secondary text-sm font-medium border-r border-gray-100 ${variant === 'summary' ? 'bg-gray-100/20' : 'bg-gray-50/30'}`}>
        {label}
      </div>
      <div className={`w-2/3 p-3 text-primary text-sm ${isBold ? 'font-bold' : 'font-normal'}`}>
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto relative px-4 sm:px-0">
      <PageHeader
        title={t('details.materialQuotation', { defaultValue: 'Material Quotation' })}
        onBack={() => navigate(-1)}
      >
        <div className="w-full flex justify-center md:w-auto md:justify-start">
          <button
            onClick={handleDownload}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-secondary rounded-4xl cursor-pointer bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <img src={downloadIcon} alt="Download" className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {t('details.downloadDocument', { defaultValue: 'Download Document' })}
            </span>
          </button>
        </div>
      </PageHeader>

      {/* AI Powered Badge - Fixed on right side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 block">
        <img src={aiPoweredIcon} alt="AI Powered" className="h-9 cursor-pointer" />
      </div>

      <div className="mt-8 mb-20 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-0">

          {/* Company Branding */}
          <div className="p-6 text-center border-b border-gray-100 relative bg-gradient-to-b from-gray-50/50 to-white">
            <h3 className="text-lg font-bold text-accent uppercase tracking-[0.05em] px-4 py-1.5 inline-block">
              {document.title}
            </h3>
            <div className="text-xs text-secondary opacity-50 uppercase tracking-widest">
              Generated on {new Date(document.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-12">

            {/* 1. PROJECT OVERVIEW */}
            <section>
              <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.05em] text-center mb-3">
                {t('common.projectOverview', { ns: 'common', defaultValue: 'Project Overview' })}
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <TableRow label={`${t('project', { defaultValue: 'Project' })} ${t('common.name', { ns: 'common', defaultValue: 'Name' })}:`} value={projectName} isBold={true} />
                <TableRow label="Project ID:" value={document.project_id} />
                <TableRow label={`${t('status', { defaultValue: 'Status' })}:`} value="AI Generated Candidate" />
                <TableRow label={`${t('details.generatedAt', { defaultValue: 'Generated At' })}:`} value={new Date(document.created_at).toLocaleString()} />
              </div>
            </section>

            {/* 2. INPUT PARAMETERS */}
            {calculation?.input_summary && (
              <section>
                <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.05em] text-center mb-3">
                  Input Parameters
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {Object.entries(calculation.input_summary).map(([key, value]) => (
                    <TableRow
                      key={key}
                      label={`${formatKey(key)}:`}
                      value={formatValue(key, value)}
                      isBold={key.includes('total') || key.includes('budget')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. MATERIAL QUANTITY ESTIMATE */}
            {calculation?.material_quantity && (
              <section>
                <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.05em] text-center mb-3">
                  Material Quantity Estimate
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {Object.entries(calculation.material_quantity).map(([key, value]) => (
                    <TableRow
                      key={key}
                      label={`${formatKey(key)}:`}
                      value={value.toLocaleString()}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 4. WORK COST BREAKDOWN */}
            {calculation?.work_cost_breakdown && (
              <section>
                <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.05em] text-center mb-3">
                  Work Cost Breakdown
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {Object.entries(calculation.work_cost_breakdown).map(([key, value]) => (
                    <TableRow
                      key={key}
                      label={`${formatKey(key).replace(' Inr', '')}:`}
                      value={`₹${value.toLocaleString()}`}
                    />
                  ))}
                  {calculation.labour_and_material && (
                    <div className="bg-accent/5">
                      <TableRow label="Material Total:" value={`₹${calculation.labour_and_material.material_inr.toLocaleString()}`} isBold={true} variant="summary" />
                      <TableRow label="Labour Total:" value={`₹${calculation.labour_and_material.labour_inr.toLocaleString()}`} isBold={true} variant="summary" />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 5. AI INSIGHTS & SUGGESTIONS */}
            {aiInsights && (
              <section className="space-y-8">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.05em] text-center mb-3">
                  Engineer Insights
                </h4>

                {/* Summary Table Row Style */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <TableRow label="Engineer Summary:" value={aiInsights.engineer_summary} />
                  <TableRow label="Budget Health:" value={aiInsights.budget_health} />
                </div>

                {/* Bulleted Points Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cost Drivers */}
                  <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                    <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      Major Cost Drivers
                    </h5>
                    <ul className="space-y-2 text-xs text-secondary list-disc list-inside">
                      {aiInsights.major_cost_drivers?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>

                  {/* Risk Observations */}
                  <div className="bg-red-50/30 p-5 rounded-xl border border-red-100/50">
                    <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Risk Observations
                    </h5>
                    <ul className="space-y-2 text-xs text-secondary list-disc list-inside">
                      {aiInsights.risk_observations?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>

                  {/* Practical Suggestions */}
                  <div className="md:col-span-2 bg-blue-50/30 p-5 rounded-xl border border-blue-100/50">
                    <h5 className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Practical Suggestions
                    </h5>
                    <ul className="space-y-2 text-xs text-secondary list-disc list-inside">
                      {aiInsights.practical_suggestions?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* 6. TERMS & CONDITIONS */}
            <section>
              <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] text-center mb-8">
                Terms & Conditions
              </h4>
              <div className="space-y-3 px-4 sm:px-10 text-center">
                <p className="text-[11px] text-secondary leading-relaxed">1. Payment to be made as per schedule.</p>
                <p className="text-[11px] text-secondary leading-relaxed">2. Contractor to follow all local authority approvals and safety regulations.</p>
                <p className="text-[11px] text-secondary leading-relaxed">3. This proposal is valid for 30 days from its date of issue.</p>
                <p className="text-[11px] text-secondary leading-relaxed italic opacity-70">This is an AI-generated document for estimation purposes.</p>
              </div>
            </section>

            {/* 7. SIGNATURES */}
            <section className="pt-12 flex justify-between  gap-16">

              {/* Contractor Signature */}
              <div className="space-y-4 w-[260px]">
                <div className="border-b border-primary/40 h-12 relative flex items-center">

                  {/* Sign here text (only when no signature) */}
                  {!signatures.contractor && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs text-secondary opacity-60">
                      Sign here
                    </span>
                  )}

                  {/* Signature image */}
                  {signatures.contractor && (
                    <img
                      src={signatures.contractor}
                      alt="Contractor Signature"
                      className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-10 object-contain"
                    />
                  )}

                  {/* Pencil icon (disabled after sign) */}
                  <span
                    onClick={() => {
                      if (!signatures.contractor) {
                        setActiveSigner('contractor');
                        setIsSignatureOpen(true);
                      }
                    }}
                    className={`absolute right-0 bottom-1 
                        ${signatures.contractor
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-accent/70 cursor-pointer hover:text-accent'}
                    `}
                  >
                    <Pencil size={18} strokeWidth={1.8} />
                  </span>
                </div>

                <p className="text-[10px] font-bold text-primary uppercase text-center tracking-widest">
                  Contractor Signature
                </p>
              </div>

              {/* Client Signature */}
              <div className="space-y-4 w-[260px]">
                <div className="border-b border-primary/40 h-12 relative flex items-center">

                  {!signatures.client && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs text-secondary opacity-60">
                      Sign here
                    </span>
                  )}

                  {signatures.client && (
                    <img
                      src={signatures.client}
                      alt="Client Signature"
                      className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-10 object-contain"
                    />
                  )}

                  {/* Pencil icon (disabled after sign) */}
                  <span
                    onClick={() => {
                      if (!signatures.client) {
                        setActiveSigner('client');
                        setIsSignatureOpen(true);
                      }
                    }}
                    className={`absolute right-0 bottom-1 
                        ${signatures.client
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-accent/70 cursor-pointer hover:text-accent'}
                    `}
                  >
                    <Pencil size={18} strokeWidth={1.8} />
                  </span>
                </div>

                <p className="text-[10px] font-bold text-primary uppercase text-center tracking-widest">
                  Client Signature
                </p>
              </div>

            </section>
          </div>
        </div>
      </div>




      {/* SIGNATURE MODAL */}
      {isSignatureOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-[90%] max-w-md shadow-xl">

            <h3 className="text-sm font-semibold mb-3 text-primary">
              Draw {activeSigner === 'contractor' ? 'Contractor' : 'Client'} Signature
            </h3>

            <div className="border rounded-md overflow-hidden">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                  width: 420,
                  height: 180,
                  className: 'bg-white'
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleClearSignature}
                className="px-4 py-1.5 text-sm border rounded-md"
              >
                Clear
              </button>

              <button
                onClick={() => setIsSignatureOpen(false)}
                className="px-4 py-1.5 text-sm border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSignature}
                disabled={isSignatureLoading}
                className="px-4 py-1.5 text-sm bg-accent text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignatureLoading ? 'Saving...' : 'Save'}
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
