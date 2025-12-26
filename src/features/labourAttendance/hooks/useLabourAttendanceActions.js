import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { showError, showSuccess } from '../../../utils/toast';
import { formatCurrencyINR } from '../utils/formatting';

/**
 * Hook for managing labour attendance actions:
 * - PDF export/download
 * - Navigation handlers
 */
export const useLabourAttendanceActions = ({
  projectName,
  activeShiftId,
  sortedShiftTypes,
  dateRange,
  summary,
  filteredLabourList,
  projectId,
}) => {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();

  const handleDownload = useCallback(() => {
    try {
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

      const shiftLabel =
        sortedShiftTypes.find((s) => String(s.id) === String(activeShiftId))?.name ||
        activeShiftId;
      addText(projectName, 18, true);
      addText(`Shift: ${shiftLabel}`, 11, false, [90, 90, 90]);
      if (dateRange) {
        addText(`Date: ${String(dateRange)}`, 11, false, [90, 90, 90]);
      }

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      addText('Summary', 14, true);
      addText(`Present: ${summary.present}  |  Absent: ${summary.absent}  |  Half Day: ${summary.halfDay}`, 11);
      addText(`Total Pay: ${formatCurrencyINR(summary.totalPay)}`, 11, true);

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      addText('Labour List', 14, true);
      const list = filteredLabourList || [];
      if (!list.length) {
        addText('No labour found', 11, false, [120, 120, 120]);
      } else {
        list.forEach((l, i) => {
          addText(
            `${i + 1}. ${l.name || ''} • ${l.role || ''} • Status: ${l.status || ''} • Pay: ${formatCurrencyINR(l.pay)}`,
            11
          );
        });
      }

      const fileName = `${projectName}_attendance_${activeShiftId}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess(t('attendancePage.downloadSuccess'));
    } catch (e) {
      console.error(e);
      showError(t('attendancePage.downloadFail'));
    }
  }, [projectName, activeShiftId, sortedShiftTypes, dateRange, summary, filteredLabourList, t]);

  const handleAddReport = useCallback(() => {
    navigate(
      getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_ADD_LABOUR, { projectId }),
      { state: { projectName } }
    );
  }, [navigate, projectId, projectName]);

  return {
    handleDownload,
    handleAddReport,
  };
};

export default useLabourAttendanceActions;

