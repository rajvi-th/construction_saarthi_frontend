import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import LabourAmountModal from '../../../components/ui/LabourAmountModal';
import RemoveMemberModal from '../../../components/ui/RemoveMemberModal';
import AudioPlayer from '../../../components/ui/AudioPlayer';
import pencilIcon from '../../../assets/icons/pencil.svg';
import { useAuth } from '../../auth/store';
import { useWorkspaceRole } from '../../dashboard/hooks';
import { useLabourProfile } from '../hooks/useLabourProfile';
import { useLabourDetailsActions } from '../hooks/useLabourDetailsActions';
import { formatCurrencyINR, formatDate, getInitials } from '../utils/formatting';

export default function LabourDetails() {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();
  const { projectId, labourId } = useParams();
  const { state } = useLocation();
  const { selectedWorkspace } = useAuth();
  const currentUserRole = useWorkspaceRole();

  const { profile, isLoading: isLoadingProfile, refetch } = useLabourProfile({
    workspaceId: selectedWorkspace,
    labourId,
  });

  const labour = profile || state?.labour || null;
  const projectName = state?.projectName || '';

  const {
    activeModal,
    setActiveModal,
    deleteOpen,
    setDeleteOpen,
    isSubmitting,
    noteText,
    setNoteText,
    voiceFile,
    setVoiceFile,
    handleEdit,
    handleDownload,
    handleAddNote,
    handlePayAdvance,
    handlePayBonus,
    handleAddDeduction,
    handleDelete,
  } = useLabourDetailsActions({
    labour,
    labourId,
    projectId,
    projectName,
    refetch,
  });

  const attendance = labour?.attendanceSummary || {};
  const wage = labour?.wageSummary || {};

  const avatarStyle = useMemo(
    () => ({
      borderColor: 'var(--color-lightGray)',
      backgroundColor: 'rgba(6,12,18,0.04)',
      color: 'var(--color-primary)',
    }),
    []
  );


  if (!labour) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title={t('labourDetails.title')} onBack={() => navigate(-1)} />
        <div className="text-sm text-secondary">
          {isLoadingProfile ? t('common.loading') : t('common.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={labour.name}
        onBack={() => navigate(-1)}
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-3xl bg-[#B02E0C0F] text-[#B02E0C] hover:bg-[#B02E0C1A] transition-colors cursor-pointer"
          >
            <img src={pencilIcon} alt={t('common.edit', { ns: 'common' })} className="w-4 h-4" />
            <span className="font-medium text-sm">{t('common.editLabour')}</span>
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            leftIcon={<Download className="text-primary-light w-5 h-5" />}
            className="h-10 px-4 whitespace-nowrap bg-white w-full sm:w-auto !rounded-full"
          >
            {t('common.downloadReport')}
          </Button>
        </div>
      </PageHeader>

      {/* Profile Section */}
      <div className="py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6" style={{ borderColor: 'var(--color-lightGray)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full sm:w-auto">
            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-semibold text-2xl border-2 flex-shrink-0 overflow-hidden"
                style={avatarStyle}
              >
                {labour.profilePhoto ? (
                  <img src={labour.profilePhoto} alt={labour.name} className="w-full h-full rounded-full object-cover " />
                ) : (
                  getInitials(labour.name)
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 min-w-0 text">
                <h2 className="text-base sm:text-lg font-semibold text-primary truncate">
                  {labour.name}
                </h2>

                <span className="w-1 h-1 rounded-full bg-primary-light shrink-0" />

                <p className="text-sm text-primary-light truncate">
                  {labour.role}
                </p>
              </div>

              <p className=" text-primary mb-1">
                {labour.contactNumber || '-'}
              </p>


              <div className="grid grid-cols-1 gap-1 w-full">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-medium w-[140px]">{t('labourDetails.baseDailyWage')}</span>
                  <span className="text-primary-light">{formatCurrencyINR(labour.defaultDailyWage ?? labour.pay)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-medium w-[140px]">{t('labourDetails.joinDate')}</span>
                  <span className="text-primary-light">{formatDate(labour.joinDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-medium w-[140px]">{t('labourDetails.assignProject')}</span>
                  <span className="text-primary-light">{projectName || '-'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Attendance Summary */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold text-primary mb-4">{t('labourDetails.attendanceSummary')}</h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-primary font-medium w-[120px]">{t('labourDetails.shift')}</div>
            <div className="text-primary-light">{attendance.shift || labour.shiftType || '-'}</div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-primary font-medium w-[120px]">{t('labourDetails.totalDays')}</div>
            <div className="text-primary-light flex flex-wrap items-center gap-3">
              {/* <span>{attendance.totalDays ?? '-'} Days</span> */}
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#34C759] inline-flex items-center justify-center text-white text-[10px]">✓</span>
                  <span>{attendance.presentDays ?? 0} Days</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#B02E0C] inline-flex items-center justify-center text-white text-[10px]">×</span>
                  <span>{attendance.absentDays ?? 0} Days</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#FF9500] inline-flex items-center justify-center text-white text-[10px]">✓</span>
                  <span>{attendance.halfDayDays ?? 0} Day</span>
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-primary font-medium w-[120px]">{t('labourDetails.attendance')}</div>
            <div className="text-primary-light">{attendance.attendancePercent ?? '-'}%</div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-primary font-medium w-[120px]">{t('labourDetails.lastMark')}</div>
            <div className="text-primary-light">{attendance.lastMark ?? '-'}</div>
          </div>
        </div>
      </div>

      {/* Wage Summary */}
      <div className="pt-6 mt-6 border-t border-gray-200" >
        <h3 className="text-[18px] font-semibold text-primary mb-4">{t('labourDetails.wageSummary')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WageCard title={t('labourDetails.totalWage')} subtitle={t('labourDetails.thisMonth')} value={formatCurrencyINR(wage.totalWage)} valueColor="text-accent" />
          <WageCard title={t('labourDetails.paidAmount')} value={formatCurrencyINR(wage.paidAmount)} valueColor="text-green-600" />
          <WageCard title={t('labourDetails.pendingAmount')} value={formatCurrencyINR(wage.pendingAmount)} valueColor="text-orange-500" />

          <WageCard
            title={t('labourDetails.advances')}
            value={formatCurrencyINR(wage.advances)}
            actionLabel={t('cards.menu.payAdvance')}
            onAction={() => setActiveModal('advance')}
          />
          <WageCard
            title={t('labourDetails.bonuses')}
            value={`₹ ${Number(wage.bonuses || 0) > 0 ? `+${Number(wage.bonuses || 0).toLocaleString('en-IN')}` : '0'}`}
            actionLabel={t('cards.menu.payAdvance')}
            onAction={() => setActiveModal('bonus')}
          />
          <WageCard
            title={t('labourDetails.deductions')}
            value={`₹ ${Number(wage.deductions || 0) > 0 ? `-${Number(wage.deductions || 0).toLocaleString('en-IN')}` : '0'}`}
            actionLabel={t('cards.menu.addDeduction')}
            onAction={() => setActiveModal('deduction')}
          />
        </div>
      </div>

      {/* Notes & Voice Memos */}
      <div className="pt-6 mt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold text-primary mb-4">{t('labourDetails.notesAndVoiceMemos')}</h3>

        {/* Add Note Form */}
        <div className="bg-white border rounded-xl p-4 mb-4" style={{ borderColor: 'var(--color-lightGray)' }}>
          <label className="block text-sm font-medium text-primary mb-2">{t('labourDetails.addNote', { defaultValue: 'Add Note' })}</label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder={t('labourDetails.writeNotePlaceholder', { defaultValue: 'Write a note…' })}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-lg border bg-white text-primary placeholder:text-secondary text-sm focus:outline-none transition-colors border-gray-200 focus:border-[rgba(6,12,18,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept="audio/*"
                multiple
                disabled={isSubmitting}
                onChange={(e) => setVoiceFile(e.target.files)}
                className="text-sm"
              />
              {voiceFile && voiceFile.length > 0 && (
                <span className="text-xs text-primary-light truncate max-w-[260px]">
                  {voiceFile.length} {voiceFile.length === 1 ? 'file' : 'files'} selected
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant="primary"
              disabled={isSubmitting || (!noteText.trim() && (!voiceFile || voiceFile.length === 0))}
              onClick={handleAddNote}
              className="w-full sm:w-auto"
            >
              {t('labourDetails.addNote', { defaultValue: 'Add Note' })}
            </Button>
          </div>
        </div>

        {/* Notes and Voice Memos Display */}
        <div className="space-y-4">
          {/* Display notes and voice memos interleaved */}
          {(() => {
            const notes = Array.isArray(labour.notes) ? labour.notes : [];
            const voiceNotes = Array.isArray(labour.voiceNotes) ? labour.voiceNotes : [];
            const voiceMemoUrl = labour.voiceMemoUrl ? [labour.voiceMemoUrl] : [];
            const allVoiceMemos = [...voiceNotes, ...voiceMemoUrl];

            // If we have notes, show them first
            if (notes.length > 0) {
              return (
                <>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-primary-light">
                    {notes.map((n, idx) => (
                      <li key={`note-${idx}`}>{n}</li>
                    ))}
                  </ul>
                  
                  {/* Show voice memos after notes */}
                  {allVoiceMemos.length > 0 && (
                    <div className="space-y-3">
                      {allVoiceMemos.map((voiceNote, idx) => (
                        <AudioPlayer key={`voice-${idx}`} src={voiceNote} />
                      ))}
                    </div>
                  )}
                </>
              );
            }

            // If no notes but we have voice memos, show them
            if (allVoiceMemos.length > 0) {
              return (
                <div className="space-y-3">
                  {allVoiceMemos.map((voiceNote, idx) => (
                    <AudioPlayer key={`voice-${idx}`} src={voiceNote} />
                  ))}
                </div>
              );
            }

            // If nothing, show empty state
            return (
              <p className="text-sm text-primary-light italic">
                {t('labourDetails.noNotes', { defaultValue: 'No notes or voice memos yet' })}
              </p>
            );
          })()}
        </div>
      </div>

      {/* Delete - Hide for supervisor role */}
      {currentUserRole?.toLowerCase() !== 'supervisor' && (
        <div className="pt-6">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 text-accent text-sm font-medium hover:underline cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.deleteLabour')}
          </button>
        </div>
      )}

      <LabourAmountModal
        isOpen={activeModal === 'advance'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`${t('cards.menu.payAdvance')} • ${labour.name || ''}`}
        amountLabel={t('cards.payableAmount')}
        primaryActionText={t('common.add')}
        isSubmitting={isSubmitting}
        onSubmit={handlePayAdvance}
      />

      <LabourAmountModal
        isOpen={activeModal === 'bonus'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`${t('cards.menu.addBonus')} • ${labour.name || ''}`}
        amountLabel={t('cards.payableAmount')}
        primaryActionText={t('common.add')}
        isSubmitting={isSubmitting}
        onSubmit={handlePayBonus}
      />

      <LabourAmountModal
        isOpen={activeModal === 'deduction'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`${t('cards.menu.addDeduction')} • ${labour.name || ''}`}
        amountLabel={t('cards.payableAmount')}
        primaryActionText={t('common.add')}
        isSubmitting={isSubmitting}
        onSubmit={handleAddDeduction}
      />

      <RemoveMemberModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        memberName={labour.name || ''}
        title={t('common.deleteLabour')}
        description={t('cards.deleteDescription', { defaultValue: 'Are you sure you want to remove labour from this project? This action is irreversible, and your data cannot be recovered.' })}
        confirmText={t('common.yesDelete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

function WageCard({ title, subtitle, value, valueColor = 'text-primary', actionLabel, onAction }) {
  return (
    <div className="border rounded-xl p-4 bg-white" style={{ borderColor: 'var(--color-lightGray)' }}>
      <div className='flex justify-between items-center'>
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-primary">{title}</p>
          {subtitle && <p className="text-xs text-primary-light">{subtitle}</p>}
        </div>
        <p className={`text-sm font-semibold mt-2 ${valueColor}`}>{value}</p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 text-sm text-accent font-medium flex items-center gap-2 hover:underline cursor-pointer"
        >
          <span className="w-4 h-4 rounded-full bg-accent text-white inline-flex items-center justify-center text-[12px]">+</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}


