/**
 * Report Details Page
 * Displays detailed information about a specific report
 */

import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Download, Eye, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Button from '../../../components/ui/Button';
import { useWorkspaceRole } from '../../dashboard/hooks';

import pencilIcon from '../../../assets/icons/pencil.svg';
import { ROUTES, getRoute } from '../../../constants/routes';

export default function ReportDetails() {
  const { t } = useTranslation('dpr');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { projectId, reportId } = useParams();
  const location = useLocation();
  const report = location.state?.report;
  const projectName = location.state?.projectName || 'Project';
  const currentUserRole = useWorkspaceRole();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Check if user can edit/delete reports (builder role cannot edit/delete)
  const canEditDelete = currentUserRole?.toLowerCase() !== 'builder';

  // If report data is not in state, fetch it (mock for now)
  if (!report) {
    // In real app, fetch report by ID
    return (
      <div className="flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Mock data - in real app, this would come from the report object
  const reportData = {
    title: report.title || report.description || 'Slab Shuttering Completed',
    workTime: {
      start: '10:00 am',
      end: '6:00 pm',
    },
    labour: {
      present: report.presentLabours || 24,
      halfDay: report.halfDayLabours || 2,
      absent: report.absentLabours || 3,
    },
    photos: report.photos || [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    ],
    workProgress: {
      todaySummary: report.todaySummary || 'Slab shuttering completed. RCC for 1st floor poured.',
      plannedWork: report.plannedWork || 'Shuttering + RCC Pouring for 1st floor',
      actualWork: report.actualWork || 'Completed pouring, 80% shuttering done',
      delayReason: report.delayReason || 'Labour arrived late due to transport issue',
    },
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download report:', reportId);
  };

  const handleEdit = () => {
    // Build a complete payload for edit form (includes fallbacks used in details page)
    const reportForEdit = {
      ...report,
      workTime: {
        start: report.startTime || report.start_time || report.workTime?.start || reportData.workTime.start,
        end: report.endTime || report.end_time || report.workTime?.end || reportData.workTime.end,
      },
      labour: {
        present: report.presentLabours || report.present_labours || report.labour?.present || reportData.labour.present,
        halfDay: report.halfDayLabours || report.half_day_labours || report.labour?.halfDay || reportData.labour.halfDay,
        absent: report.absentLabours || report.absent_labours || report.labour?.absent || reportData.labour.absent,
      },
      workProgress: {
        todaySummary: report.todaySummary || report.today_summary || report.workProgress?.todaySummary || reportData.workProgress.todaySummary,
        plannedWork: report.plannedWork || report.planned_work || report.workProgress?.plannedWork || reportData.workProgress.plannedWork,
        actualWork: report.actualWork || report.actual_work || report.workProgress?.actualWork || reportData.workProgress.actualWork,
        delayReason: report.delayReason || report.delay_reason || report.workProgress?.delayReason || reportData.workProgress.delayReason,
      },
      photos: report.photos || report.media || report.images || reportData.photos,
      // flat keys (if backend expects these)
      startTime: report.startTime || report.start_time || reportData.workTime.start,
      endTime: report.endTime || report.end_time || reportData.workTime.end,
      presentLabours: report.presentLabours || report.present_labours || reportData.labour.present,
      halfDayLabours: report.halfDayLabours || report.half_day_labours || reportData.labour.halfDay,
      absentLabours: report.absentLabours || report.absent_labours || reportData.labour.absent,
      todaySummary: report.todaySummary || report.today_summary || reportData.workProgress.todaySummary,
      plannedWork: report.plannedWork || report.planned_work || reportData.workProgress.plannedWork,
      actualWork: report.actualWork || report.actual_work || reportData.workProgress.actualWork,
      delayReason: report.delayReason || report.delay_reason || reportData.workProgress.delayReason,
    };

    navigate(getRoute(ROUTES.DPR.ADD_REPORT, { projectId }), {
      state: {
        report: reportForEdit,
        projectName,
        projectId,
        isEdit: true,
      },
    });
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete API call
    console.log('Delete report:', reportId);
    // Navigate back to project reports after deletion
    navigate(getRoute(ROUTES.DPR.PROJECT_REPORTS, { projectId }), {
      state: { projectName, projectId },
    });
    setIsDeleteModalOpen(false);
  };

  const handlePhotoClick = (photoUrl) => {
    // Open photo in new tab or modal
    window.open(photoUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      {/* Header with actions */}
      <PageHeader title={reportData.title}
      showBackButton={true}
      backTo={ROUTES.DPR.PROJECT_REPORTS}
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 w-full lg:w-auto lg:justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            leftIcon={<Download />}
            iconClassName="w-4 h-4 text-secondary"
          >
            {t('actions.downloadReport')}
          </Button>
          {canEditDelete && (
            <Button
              size="sm"
              variant="accentSoft"
              onClick={handleEdit}
              leftIcon={<img src={pencilIcon} alt="" aria-hidden="true" />}
              iconClassName="w-4 h-4"
            >
              {t('actions.editReport')}
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Main Content */}
      <div>
        {/* Today's Work Time Duration */}
        <div>
          <h2 className="text-md font-medium mb-3">
            {t('form.reportDetails.workTimeDuration')}
          </h2>
          <div className="flex items-center gap-2 text-secondary">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-normal">
              {reportData.workTime.start} - {reportData.workTime.end}
            </span>
          </div>
        </div>

        {/* Total Labour Today */}
        <div>
          <h2 className="pt-4 text-md font-medium mb-3">
            {t('form.reportDetails.totalLabour')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Present Card */}
            <div className="rounded-lg p-4 text-center" style={{ minHeight: '79px', backgroundColor: 'rgba(249, 245, 239, 0.6)', border: '1px solid rgba(6, 12, 18, 0.06)' }}>
              <p className="text-3xl font-medium mb-1" style={{ color: '#34C759' }}>
                {reportData.labour.present}
              </p>
              <p className="text-sm font-normal text-primary">{t('form.reportDetails.present')}</p>
            </div>
            {/* Half Day Card */}
            <div className="rounded-lg p-4 text-center" style={{ minHeight: '79px', backgroundColor: 'rgba(249, 245, 239, 0.6)', border: '1px solid rgba(6, 12, 18, 0.06)' }}>
              <p className="text-3xl font-medium mb-1" style={{ color: '#FF9500' }}>
                {reportData.labour.halfDay}
              </p>
              <p className="text-sm font-normal text-primary">{t('form.reportDetails.halfDay')}</p>
            </div>
            {/* Absent Card */}
            <div className="rounded-lg p-4 text-center" style={{ minHeight: '79px', backgroundColor: 'rgba(249, 245, 239, 0.6)', border: '1px solid rgba(6, 12, 18, 0.06)' }}>
              <p className="text-3xl font-medium mb-1" style={{ color: '#B02E0C' }}>
                {reportData.labour.absent}
              </p>
              <p className="text-sm font-normal text-primary">{t('form.reportDetails.absent')}</p>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div>
          <h2 className="pt-4 text-base font-medium text-primary mb-3">
            {t('form.reportDetails.photos')}
          </h2>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 sm:gap-[14px] pb-2">
              {reportData.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden cursor-pointer group flex-shrink-0"
                  style={{ 
                    width: '160px',
                    height: '160px',
                    border: '1px solid rgba(6, 12, 18, 0.06)' 
                  }}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Progress Section */}
        <div>
          <h2 className="py-4 text-lg font-medium">
            {t('form.reportDetails.workProgress')}
          </h2>
          <div className="space-y-4">
            {/* Today's Work Summary */}
            <div>
              <h3 className="text-md font-medium  mb-2">
                {t('form.reportDetails.todaySummary')}
              </h3>
              <p className="text-md text-secondary">{reportData.workProgress.todaySummary}</p>
            </div>

            {/* Planned Work */}
            <div>
              <h3 className="text-md font-medium text-primary mb-2">
                {t('form.reportDetails.plannedWork')}
              </h3>
              <p className="text-md text-secondary">{reportData.workProgress.plannedWork}</p>
            </div>

            {/* Actual Work Done */}
            <div>
              <h3 className="text-md font-medium text-primary mb-2">
                {t('form.reportDetails.actualWork')}
              </h3>
              <p className="text-md text-secondary">{reportData.workProgress.actualWork}</p>
            </div>

            {/* Reason for Delay */}
            <div>
              <h3 className="text-md font-medium text-primary mb-2">
                {t('form.reportDetails.delayReason')}
              </h3>
              <p className="text-md text-secondary">{reportData.workProgress.delayReason}</p>
            </div>
          </div>
        </div>

        {/* Delete Report Button - Only show if user can delete */}
        {canEditDelete && (
          <div className="pt-4">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-accent transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">{t('actions.deleteReport')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t('deleteModal.title', { defaultValue: 'Delete Report' })}
        message={t('deleteModal.message', { 
          defaultValue: 'Are you sure you want to delete this report? This action is irreversible, and your data cannot be recovered.' 
        })}
        confirmText={t('deleteModal.confirmText', { defaultValue: 'Yes, Delete' })}
        cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
        confirmVariant="primary"
      />
    </div>
  );
}

