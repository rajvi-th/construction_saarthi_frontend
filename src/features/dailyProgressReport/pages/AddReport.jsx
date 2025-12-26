/**
 * Add Report Page
 * Form to add a new daily progress report
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import TimeInput from '../../../components/ui/TimeInput';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import FileUpload from '../../../components/ui/FileUpload';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { ROUTES, getRoute } from '../../../constants/routes';

export default function AddReport() {
  const { t } = useTranslation('dpr');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName || 'Project';
  const isEdit = Boolean(location.state?.isEdit);
  const report = location.state?.report || null;

  const toTimeValue = (input) => {
    if (input == null) return '';

    // Already in HH:MM (24h) format
    if (typeof input === 'string' && /^\d{2}:\d{2}$/.test(input.trim())) {
      return input.trim();
    }

    if (typeof input !== 'string') return '';

    const raw = input.trim();

    // Formats like "10:00 am", "10:00 AM"
    const match12h = raw.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);
    if (match12h) {
      let hours = parseInt(match12h[1], 10);
      const minutes = parseInt(match12h[2], 10);
      const meridiem = match12h[3].toLowerCase();

      if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';
      if (minutes < 0 || minutes > 59) return '';
      if (hours < 1 || hours > 12) return '';

      if (meridiem === 'pm' && hours !== 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return '';
  };

  const normalizeStatus = (value) => {
    if (!value) return '';
    const v = String(value).trim().toLowerCase();
    if (v === 'completed') return 'completed';
    if (v === 'upcoming') return 'upcoming';
    if (v === 'in_progress' || v === 'inprogress' || v === 'in progress' || v === 'in-progress') {
      return 'in_progress';
    }
    return String(value);
  };

  const normalizeMediaToUrls = (media) => {
    if (!Array.isArray(media)) return [];
    return media
      .map((m) => {
        if (!m) return null;
        if (typeof m === 'string') return m;
        if (typeof m === 'object') return m.url || m.path || m.uri || m.src || null;
        return null;
      })
      .filter(Boolean);
  };

  const normalizeReportToFormData = (r) => {
    if (!r) return null;

    const startTime = toTimeValue(r.startTime ?? r.start_time ?? r.workTime?.start ?? '');
    const endTime = toTimeValue(r.endTime ?? r.end_time ?? r.workTime?.end ?? '');

    const presentLabours = r.presentLabours ?? r.present_labours ?? r.labour?.present ?? '';
    const halfDayLabours = r.halfDayLabours ?? r.half_day_labours ?? r.labour?.halfDay ?? '';
    const absentLabours = r.absentLabours ?? r.absent_labours ?? r.labour?.absent ?? '';

    const todaySummary =
      r.todaySummary ?? r.today_summary ?? r.workProgress?.todaySummary ?? r.summary ?? '';
    const plannedWork = r.plannedWork ?? r.planned_work ?? r.workProgress?.plannedWork ?? '';
    const actualWork = r.actualWork ?? r.actual_work ?? r.workProgress?.actualWork ?? '';
    const delayReason = r.delayReason ?? r.delay_reason ?? r.workProgress?.delayReason ?? '';

    return {
      startTime,
      endTime,
      status: normalizeStatus(r.status ?? ''),
      presentLabours: presentLabours === '' ? '00' : String(presentLabours),
      halfDayLabours: halfDayLabours === '' ? '00' : String(halfDayLabours),
      absentLabours: absentLabours === '' ? '00' : String(absentLabours),
      todaySummary,
      plannedWork,
      actualWork,
      delayReason,
    };
  };

  // Form state
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    status: '',
    presentLabours: '00',
    halfDayLabours: '00',
    absentLabours: '00',
    todaySummary: '',
    plannedWork: '',
    actualWork: '',
    delayReason: '',
  });

  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit || !report) return;

    const normalized = normalizeReportToFormData(report);
    if (normalized) setFormData(normalized);

    const media = report.photos ?? report.media ?? report.images ?? [];
    setExistingMedia(normalizeMediaToUrls(media));
  }, [isEdit, report]);

  // Status options
  const statusOptions = [
    { value: 'completed', label: t('filter.completed') },
    { value: 'in_progress', label: t('filter.inProgress') },
    { value: 'upcoming', label: t('filter.upcoming') },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleFileSelect = (selectedFiles) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const filePreviews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      filePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startTime) {
      newErrors.startTime = t('form.errors.startTimeRequired');
    }
    if (!formData.endTime) {
      newErrors.endTime = t('form.errors.endTimeRequired');
    }
    if (!formData.status) {
      newErrors.status = t('form.errors.statusRequired');
    }
    if (!formData.todaySummary) {
      newErrors.todaySummary = t('form.errors.todaySummaryRequired');
    }
    if (!formData.plannedWork) {
      newErrors.plannedWork = t('form.errors.plannedWorkRequired');
    }
    if (!formData.actualWork) {
      newErrors.actualWork = t('form.errors.actualWorkRequired');
    }
    if (!formData.delayReason) {
      newErrors.delayReason = t('form.errors.delayReasonRequired');
    }
    // Photos/videos required (either existing or newly selected)
    if (files.length === 0 && existingMedia.length === 0) {
      newErrors.files = tCommon('required', { defaultValue: 'Required' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Submit form data to API
      console.log('Form data:', formData);
      console.log('Files:', files);

      if (isEdit && report?.id) {
        navigate(getRoute(ROUTES.DPR.REPORT_DETAILS, { projectId, reportId: report.id }), {
          state: { report, projectName, projectId },
        });
        return;
      }

      // Navigate back to project reports
      navigate(getRoute(ROUTES.DPR.PROJECT_REPORTS, { projectId }), {
        state: { projectName, projectId },
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && report?.id) {
      navigate(getRoute(ROUTES.DPR.REPORT_DETAILS, { projectId, reportId: report.id }), {
        state: { report, projectName, projectId },
      });
      return;
    }

    navigate(getRoute(ROUTES.DPR.PROJECT_REPORTS, { projectId }), {
      state: { projectName, projectId },
    });
  };

  return (      
      <div className="max-w-4xl mx-auto">
        <PageHeader title={isEdit ? t('actions.editReport') : t('form.title')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Today's Work Time Duration */}
          <div>
            <label className="block text-md font-medium text-black mb-3">
              {t('form.workTimeDuration.label')}<span>*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TimeInput
                label={t('form.workTimeDuration.startTime')}
                placeholder={t('form.workTimeDuration.startTime')}
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
                error={errors.startTime}
              />
              <TimeInput
                label={t('form.workTimeDuration.endTime')}
                placeholder={t('form.workTimeDuration.endTime')}
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
                error={errors.endTime}
              />
            </div>
          </div>

          {/* Status */}
          <Dropdown
            label={t('form.status.label')}
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            options={statusOptions}
            placeholder={t('form.status.placeholder')}
            required
            error={errors.status}
          />

          {/* Total Labour Today */}
          <div>
            <label className="block text-md font-medium text-black mb-3">
              {t('form.labour.label')}<span>*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberInput
                label={t('form.labour.present')}
                value={formData.presentLabours}
                onChange={(e) => handleChange('presentLabours', e.target.value)}
                placeholder="00"
                required
              />
              <NumberInput
                label={t('form.labour.halfDay')}
                value={formData.halfDayLabours}
                onChange={(e) => handleChange('halfDayLabours', e.target.value)}
                placeholder="00"
                required
              />
              <NumberInput
                label={t('form.labour.absent')}
                value={formData.absentLabours}
                onChange={(e) => handleChange('absentLabours', e.target.value)}
                placeholder="00"
                required
              />
            </div>
          </div>

          {/* Photos/Videos */}
          <div>
            <label className="block text-md font-medium text-black mb-3">
              {t('form.photosVideos.label')}<span>*</span>
            </label>
            <FileUpload
              title={t('form.photosVideos.title')}
              supportedFormats="JPG, PNG, Mp4"
              maxSize={10}
              maxSizeUnit="MB"
              onFileSelect={handleFileSelect}
              accept=".jpg,.jpeg,.png,.mp4"
              uploadButtonText={t('actions.upload')}
              supportedFormatLabel={t('form.photosVideos.supportedFormatLabel')}
            />
            {errors.files && (
              <p className="text-sm text-red-600 mt-2">{errors.files}</p>
            )}

            {(existingMedia.length > 0 || filePreviews.length > 0) && (
              <div className="mt-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-3 sm:gap-[14px] pb-2">
                  {existingMedia.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        width: '160px',
                        height: '160px',
                        border: '1px solid rgba(6, 12, 18, 0.06)',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Existing ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExistingMedia((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  ))}

                  {filePreviews.map(({ file, url }, idx) => {
                    const isVideo = file.type?.startsWith('video/');
                    return (
                      <div
                        key={`new-${idx}`}
                        className="relative rounded-lg overflow-hidden flex-shrink-0 bg-black/5"
                        style={{
                          width: '160px',
                          height: '160px',
                          border: '1px solid rgba(6, 12, 18, 0.06)',
                        }}
                      >
                        {isVideo ? (
                          <video src={url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={url} alt={file.name} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                          aria-label="Remove"
                        >
                          <X className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Work Progress */}
          <div>
            <label className="block text-md font-medium text-black mb-3">
              {t('form.workProgress.label')}<span>*</span>
            </label>
            <div className="space-y-4">
              <Input
                label={t('form.workProgress.todaySummary')}
                value={formData.todaySummary}
                onChange={(e) => handleChange('todaySummary', e.target.value)}
                placeholder={t('form.workProgress.todaySummaryPlaceholder')}
                required
                error={errors.todaySummary}
              />
              <Input
                label={t('form.workProgress.plannedWork')}
                value={formData.plannedWork}
                onChange={(e) => handleChange('plannedWork', e.target.value)}
                placeholder={t('form.workProgress.plannedWorkPlaceholder')}
                required
                error={errors.plannedWork}
              />
              <Input
                label={t('form.workProgress.actualWork')}
                value={formData.actualWork}
                onChange={(e) => handleChange('actualWork', e.target.value)}
                placeholder={t('form.workProgress.actualWorkPlaceholder')}
                required
                error={errors.actualWork}
              />
              <Input
                label={t('form.workProgress.delayReason')}
                value={formData.delayReason}
                onChange={(e) => handleChange('delayReason', e.target.value)}
                placeholder={t('form.workProgress.delayReasonPlaceholder')}
                required
                error={errors.delayReason}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
            >
              {tCommon('save', { defaultValue: 'Save' })}
            </Button>
        </div>
      </form>
    </div>
  );
}

