import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  fromProjects,
  fromDashboard,
}) => {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();

  const handleDownload = useCallback(() => {
    try {
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
      doc.text('ATTENDANCE REPORT', margin, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${projectName}   •   ${String(dateRange || '')}`, margin, 28);

      currentY = 45;

      // --- Info Grid (Compact) ---
      const shiftLabel = sortedShiftTypes.find((s) => String(s.id) === String(activeShiftId))?.name || activeShiftId;

      autoTable(doc, {
        startY: currentY,
        body: [
          [
            { content: 'PROJECT NAME', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7 } },
            { content: 'SHIFT / TIMING', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7 } }
          ],
          [
            { content: projectName, styles: { fontSize: 9, textColor: [40, 40, 40] } },
            { content: shiftLabel, styles: { fontSize: 9, textColor: [40, 40, 40] } }
          ],
          [
            { content: 'DATE RANGE', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7, cellPadding: { top: 4 } } },
            { content: 'TOTAL PAYOUT', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 7, cellPadding: { top: 4 } } }
          ],
          [
            { content: String(dateRange || '-'), styles: { fontSize: 9, textColor: [40, 40, 40] } },
            { content: formatCurrencyINR(summary.totalPay).replace(' ', ''), styles: { fontSize: 10, fontStyle: 'bold', textColor: accentColor } }
          ]
        ],
        theme: 'plain',
        styles: { cellPadding: 1 },
        margin: { left: margin },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } }
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // --- Summary Pills (Compact) ---
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      const summaryText = `PRESENT: ${summary.present}   |   ABSENT: ${summary.absent}   |   HALF DAY: ${summary.halfDay}`;
      doc.text(summaryText, margin + 4, currentY + 6.5);

      currentY += 18;

      // --- Labour List (Ultra-Compact) ---
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('DETAILED LABOUR LIST', margin, currentY);
      currentY += 4;

      const list = filteredLabourList || [];
      const tableData = list.map((l, i) => [
        i + 1,
        l.name || '-',
        l.role || '-',
        l.status || '-',
        formatCurrencyINR(l.pay).replace(' ', '')
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'NAME', 'ROLE', 'STATUS', 'PAYOUT']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: [240, 240, 240] },
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10 },
          4: { halign: 'right', fontStyle: 'bold' }
        },
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

      const fileName = `${projectName?.replace(/\s+/g, '_')}_Attendance_Summary.pdf`;
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
      { state: { projectName, fromProjects, fromDashboard } }
    );
  }, [navigate, projectId, projectName]);

  return {
    handleDownload,
    handleAddReport,
  };
};

export default useLabourAttendanceActions;

