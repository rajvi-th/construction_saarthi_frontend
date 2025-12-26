import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { showError, showLoading, showSuccess, updateToast } from '../../../utils/toast';
import { useAuth } from '../../auth/store';
import { addLabourNote, createPayLabour, deleteLabour } from '../api/labourAttendanceApi';
import { formatCurrencyINR } from '../utils/formatting';
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
  const { selectedWorkspace } = useAuth();

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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(String(text ?? ''), maxWidth);
      lines.forEach((line) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.55;
      });
      y += 4;
    };

    const attendance = labour?.attendanceSummary || {};
    const wage = labour?.wageSummary || {};

    addText(labour.name || t('labourDetails.title'), 18, true);
    if (labour.role) addText(labour.role, 11, false, [90, 90, 90]);
    if (projectName) addText(`Project: ${projectName}`, 11, false, [90, 90, 90]);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    addText(t('labourDetails.attendanceSummary'), 14, true);
    addText(`Shift: ${attendance.shift || labour.shiftType || '-'}`, 11);
    addText(`Total Days: ${attendance.totalDays ?? '-'}`, 11);
    addText(`Attendance: ${attendance.attendancePercent ?? '-'}%`, 11);
    addText(`Last Mark: ${attendance.lastMark ?? '-'}`, 11);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    addText(t('labourDetails.wageSummary'), 14, true);
    addText(`Total Wage: ${formatCurrencyINR(wage.totalWage)}`, 11);
    addText(`Paid Amount: ${formatCurrencyINR(wage.paidAmount)}`, 11);
    addText(`Pending Amount: ${formatCurrencyINR(wage.pendingAmount)}`, 11);
    addText(`Advances: ${formatCurrencyINR(wage.advances)}`, 11);
    addText(`Bonuses: ${formatCurrencyINR(wage.bonuses)}`, 11);
    addText(`Deductions: ${formatCurrencyINR(wage.deductions)}`, 11);

    const fileName = `${labour.name || 'Labour'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    showSuccess(t('attendancePage.downloadSuccess'));
  }, [labour, projectName, t]);

  const handleAddNote = useCallback(async () => {
    const wid = toNumber(selectedWorkspace);
    const lid = toNumber(labour?.id || labourId);
    const pid = toNumber(projectId);
    
    if (!wid || !lid || !pid) {
      showError(t('labourDetails.missingDetails', { defaultValue: 'Missing workspace/labour/project details' }));
      return;
    }

    if (!noteText.trim() && (!voiceFile || voiceFile.length === 0)) {
      showError(t('labourDetails.emptyNote', { defaultValue: 'Please enter a note or select voice file(s)' }));
      return;
    }

    const fd = new FormData();
    fd.append('workspaceId', String(wid));
    fd.append('labourId', String(lid));
    fd.append('projectId', String(pid));
    
    if (noteText.trim()) {
      fd.append('noteText', noteText.trim());
    }
    
    // Append all voice files
    if (voiceFile && voiceFile.length > 0) {
      Array.from(voiceFile).forEach((file) => {
        fd.append('voiceNotes_LabourAttendance', file);
      });
    }

    const toastId = showLoading(t('labourDetails.savingNote', { defaultValue: 'Saving note…' }));
    setIsSubmitting(true);
    try {
      await addLabourNote(fd);
      updateToast(toastId, { type: 'success', message: t('labourDetails.noteAdded', { defaultValue: 'Note added successfully' }) });
      setNoteText('');
      setVoiceFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][accept="audio/*"]');
      if (fileInput) fileInput.value = '';
      await refetch?.();
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.noteAddFail', { defaultValue: 'Failed to add note' }) });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWorkspace, labour, labourId, projectId, noteText, voiceFile, refetch, t]);

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

