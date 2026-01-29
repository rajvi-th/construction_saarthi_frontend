import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { showError, showLoading, showSuccess, updateToast } from '../../../utils/toast';
import { useAuth } from '../../auth/store';
import { addLabourNote, createPayLabour, deleteLabour } from '../api/labourAttendanceApi';
import { formatCurrencyINR, formatDate } from '../utils/formatting';
import { toNumber } from '../utils/formatting';

/**
 * Hook for managing labour details actions:
 * - Modal state management
 * - Notes submission
 * - Advance/Bonus/Deduction payments
 * - PDF export
 * - Edit navigation
 */
export const useLabourDetailsActions = ({ labour, labourId, projectId, projectName, refetch }) => {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();
  const { user, selectedWorkspace } = useAuth();

  const [activeModal, setActiveModal] = useState(null); // 'advance' | 'bonus' | 'deduction' | null
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState('');
  const [voiceFile, setVoiceFile] = useState(null); // Can be FileList or null

  const handleEdit = useCallback(() => {
    if (!labour) return;
    navigate(getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_ADD_LABOUR, { projectId }), {
      state: {
        projectName,
        editLabour: {
          id: labour.id,
          name: labour.name,
          role: labour.role,
          category: labour.category || labour.category_id || labour.categoryId,
          category_id: labour.category || labour.category_id || labour.categoryId,
          assignProject: labour.assignProject || labour.projectId || projectId,
          projectId: labour.projectId || labour.project_id,
          shiftType: labour.shiftType,
          shiftTypeId: labour.shiftTypeId || labour.shift_type_id,
          contactNumber: labour.contactNumber,
          countryCode: labour.countryCode,
          phoneNumber: labour.phoneNumber,
          aadharNumber: labour.aadharNumber || labour.aadhar_number,
          defaultDailyWage: labour.defaultDailyWage ?? labour.pay,
          joinDate: labour.joinDate || labour.join_date || null,
          profilePhoto: labour.profilePhoto || labour.profilePhotoPreview || '',
          profilePhotoPreview: labour.profilePhoto || labour.profilePhotoPreview || '',
          aadharCardPhoto: labour.aadharCardPhoto || labour.aadhar_card_photo || labour.aadharCard || '',
          insurancePhoto: labour.insurancePhoto || labour.insurance_photo || labour.insurance || '',
        },
      },
    });
  }, [labour, projectId, projectName, navigate]);

  const handleDownload = useCallback(() => {
    if (!labour) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const accentColor = [176, 46, 12]; // #B02E0C
    let currentY = 0;

    // --- Modern Sleek Header ---
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(labour.name?.toUpperCase() || 'LABOUR PROFILE', margin, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${labour.role || ''}   •   ${projectName || ''}`, margin, 28);

    currentY = 45;

    // --- Info Grid (Compact) ---
    autoTable(doc, {
      startY: currentY,
      body: [
        [
          { content: t('labourDetails.contact').toUpperCase(), styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7 } },
          { content: t('labourDetails.baseDailyWage').toUpperCase(), styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7 } }
        ],
        [
          { content: labour.contactNumber || '-', styles: { fontSize: 10, textColor: [40, 40, 40] } },
          { content: formatCurrencyINR(labour.defaultDailyWage ?? labour.pay).replace(' ', ''), styles: { fontSize: 10, textColor: [40, 40, 40] } }
        ],
        [
          { content: t('labourDetails.joinDate').toUpperCase(), styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7, cellPadding: { top: 4 } } },
          { content: t('labourDetails.assignProject').toUpperCase(), styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7, cellPadding: { top: 4 } } }
        ],
        [
          { content: formatDate(labour.joinDate), styles: { fontSize: 10, textColor: [40, 40, 40] } },
          { content: projectName || '-', styles: { fontSize: 10, textColor: [40, 40, 40] } }
        ]
      ],
      theme: 'plain',
      styles: { cellPadding: 1 },
      margin: { left: margin },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } }
    });

    currentY = doc.lastAutoTable.finalY + 12;

    // --- Sections with Compact Styling ---
    const renderSectionHeader = (title, y) => {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y - 5, pageWidth - (margin * 2), 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(title.toUpperCase(), margin + 2, y);
      return y + 6;
    };

    // --- Attendance Summary ---
    currentY = renderSectionHeader(t('labourDetails.attendanceSummary'), currentY);
    const attendance = labour?.attendanceSummary || {};

    autoTable(doc, {
      startY: currentY,
      head: [['SHIFT', 'TOTAL', 'PRESENT', 'ABSENT', 'HALF DAY', 'OT']],
      body: [[
        attendance.shift || labour.shiftType || '-',
        attendance.totalDays ?? 0,
        attendance.presentDays ?? 0,
        attendance.absentDays ?? 0,
        attendance.halfDayDays ?? 0,
        attendance.otDays ?? 0
      ]],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin },
    });

    currentY = doc.lastAutoTable.finalY + 12;

    // --- Wage Highlights (Modern Cards Look) ---
    currentY = renderSectionHeader(t('labourDetails.wageSummary'), currentY);
    const wage = labour?.wageSummary || {};

    autoTable(doc, {
      startY: currentY,
      head: [['CATEGORY', 'AMOUNT']],
      body: [
        [t('labourDetails.totalWage'), { content: formatCurrencyINR(wage.totalWage).replace(' ', ''), styles: { fontStyle: 'bold', textColor: accentColor } }],
        [t('labourDetails.paidAmount'), { content: formatCurrencyINR(wage.paidAmount).replace(' ', ''), styles: { textColor: [21, 128, 61] } }],
        [t('labourDetails.pendingAmount'), { content: formatCurrencyINR(wage.pendingAmount).replace(' ', ''), styles: { textColor: [194, 65, 12] } }],
        [t('labourDetails.advances'), formatCurrencyINR(wage.advances).replace(' ', '')],
        [t('labourDetails.bonuses'), formatCurrencyINR(wage.bonuses).replace(' ', '')],
        [t('labourDetails.deductions'), formatCurrencyINR(wage.deductions).replace(' ', '')]
      ],
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: margin },
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Construction Saarthi   |   Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    const fileName = `${labour.name?.replace(/\s+/g, '_')}_Detailed_Report.pdf`;
    doc.save(fileName);
    showSuccess(t('attendancePage.downloadSuccess'));
  }, [labour, projectName, t]);

  const handleAddNote = useCallback(async (data) => {
    const wid = toNumber(selectedWorkspace);
    const lid = toNumber(labour?.id || labourId);
    const pid = toNumber(projectId);

    if (!wid || !lid || !pid) {
      showError(t('labourDetails.missingDetails', { defaultValue: 'Missing workspace/labour/project details' }));
      return;
    }

    const { noteText: text, voiceFile: files } = data || {};

    const fd = new FormData();
    fd.append('workspaceId', String(wid));
    fd.append('labourId', String(lid));
    fd.append('projectId', String(pid));
    fd.append('noteText', text?.trim() || 'Voice Memo');

    // Append voice file if exists
    if (files && files.length > 0 && files[0]) {
      const audioFile = files[0];
      console.log(`Uploading voice note: ${audioFile.size} bytes`);
      const renamedFile = new File([audioFile], `voice_${Date.now()}.mp3`, { type: audioFile.type });
      fd.append('voiceNotes_LabourAttendance', renamedFile);
    }

    const toastId = showLoading(t('labourDetails.savingNote', { defaultValue: 'Saving note…' }));
    setIsSubmitting(true);
    try {
      await addLabourNote(fd);
      updateToast(toastId, { type: 'success', message: t('labourDetails.noteAdded', { defaultValue: 'Note added successfully' }) });
      setNoteText('');
      setVoiceFile(null);
      setActiveModal(null);
      await refetch?.();
    } catch (e) {
      console.error('Add Note Error details:', e.response?.data || e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.noteAddFail', { defaultValue: 'Failed to add note' }) });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWorkspace, labour, labourId, projectId, refetch, t]);

  const handlePayAdvance = useCallback(async (amount) => {
    const amt = toNumber(amount);
    const wid = toNumber(selectedWorkspace);
    const lid = toNumber(labour?.id || labourId);
    const pid = toNumber(projectId);
    if (!amt || amt <= 0) return showError(t('labourDetails.validAmount', { defaultValue: 'Please enter a valid amount' }));
    if (!wid || !lid || !pid) return showError(t('labourDetails.missingDetails', { defaultValue: 'Missing workspace/labour details' }));

    const toastId = showLoading(t('labourDetails.addingAdvance', { defaultValue: 'Adding advance…' }));
    setIsSubmitting(true);
    try {
      await createPayLabour({
        projectId: pid,
        workspace_id: wid,
        title: 'pay advance',
        amount: amt,
        paidTo: lid,
        paidDate: '',
        method: 'Cash',
        status: 'Paid',
        expenseSections: 'labour',
      });
      updateToast(toastId, { type: 'success', message: t('labourDetails.advanceAdded', { defaultValue: 'Advance added' }) });
      setActiveModal(null);
      await refetch?.();
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.advanceFail', { defaultValue: 'Failed to add advance' }) });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWorkspace, labour, labourId, projectId, refetch, t]);

  const handlePayBonus = useCallback(async (amount) => {
    const amt = toNumber(amount);
    const wid = toNumber(selectedWorkspace);
    const lid = toNumber(labour?.id || labourId);
    const pid = toNumber(projectId);
    if (!amt || amt <= 0) return showError(t('labourDetails.validAmount', { defaultValue: 'Please enter a valid amount' }));
    if (!wid || !lid || !pid) return showError(t('labourDetails.missingDetails', { defaultValue: 'Missing workspace/labour details' }));

    const toastId = showLoading(t('labourDetails.addingBonus', { defaultValue: 'Adding bonus…' }));
    setIsSubmitting(true);
    try {
      await createPayLabour({
        projectId: pid,
        workspace_id: wid,
        title: 'pay Bonus',
        amount: amt,
        paidTo: lid,
        paidDate: '',
        method: 'Cash',
        status: 'Pending',
        expenseSections: 'labour',
      });
      updateToast(toastId, { type: 'success', message: t('labourDetails.bonusAdded', { defaultValue: 'Bonus added' }) });
      setActiveModal(null);
      await refetch?.();
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.bonusFail', { defaultValue: 'Failed to add bonus' }) });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWorkspace, labour, labourId, projectId, refetch, t]);

  const handleAddDeduction = useCallback(async (amount) => {
    const amt = toNumber(amount);
    const wid = toNumber(selectedWorkspace);
    const lid = toNumber(labour?.id || labourId);
    const pid = toNumber(projectId);
    if (!amt || amt <= 0) return showError(t('labourDetails.validAmount', { defaultValue: 'Please enter a valid amount' }));
    if (!wid || !lid || !pid) return showError(t('labourDetails.missingDetails', { defaultValue: 'Missing workspace/labour details' }));

    const toastId = showLoading(t('labourDetails.addingDeduction', { defaultValue: 'Adding deduction…' }));
    setIsSubmitting(true);
    try {
      await createPayLabour({
        projectId: pid,
        workspace_id: wid,
        title: 'Deduction',
        amount: amt,
        paidTo: lid,
        paidDate: '',
        method: 'Cash',
        status: 'Pending',
        expenseSections: 'labour',
      });
      updateToast(toastId, { type: 'success', message: t('labourDetails.deductionAdded', { defaultValue: 'Deduction added' }) });
      setActiveModal(null);
      await refetch?.();
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.deductionFail', { defaultValue: 'Failed to add deduction' }) });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWorkspace, labour, labourId, projectId, refetch, t]);

  const handleDelete = useCallback(async () => {
    const lid = toNumber(labour?.id || labourId);
    if (!lid) {
      showError(t('labourDetails.missingDetails', { defaultValue: 'Missing labour ID' }));
      return;
    }

    const toastId = showLoading(t('labourDetails.deletingLabour', { defaultValue: 'Deleting labour…' }));
    setIsSubmitting(true);
    try {
      await deleteLabour(lid);
      updateToast(toastId, { type: 'success', message: t('attendancePage.labourDeleted') });
      setDeleteOpen(false);
      navigate(
        getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_PROJECT, { projectId }),
        { replace: true, state: { projectName, deletedLabourId: labour.id } }
      );
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.deleteFail', { defaultValue: 'Failed to delete labour' }) });
      setDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [labour, labourId, projectId, projectName, navigate, t]);

  return {
    // State
    activeModal,
    setActiveModal,
    deleteOpen,
    setDeleteOpen,
    isSubmitting,
    noteText,
    setNoteText,
    voiceFile,
    setVoiceFile,
    // Actions
    handleEdit,
    handleDownload,
    handleAddNote,
    handlePayAdvance,
    handlePayBonus,
    handleAddDeduction,
    handleDelete,
  };
};

export default useLabourDetailsActions;

