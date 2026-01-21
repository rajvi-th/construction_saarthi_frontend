import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import AddLabourForm from '../components/AddLabourForm';
import { useAuth } from '../../auth/store';
import { addLabour, updateLabour } from '../api/labourAttendanceApi';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useLabourProfile } from '../hooks/useLabourProfile';
import { useState, useEffect } from 'react';

function formatYYYYMMDD(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AddLabour() {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { state } = useLocation();
  const { selectedWorkspace } = useAuth();
  const projectName = state?.projectName || '';
  const editLabour = state?.editLabour || null;
  const isEdit = Boolean(editLabour);

  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && editLabour?.id) {
      const fetchLabour = async () => {
        setIsLoading(true);
        try {
          const { getLabourById } = await import('../api/labourAttendanceApi');
          const response = await getLabourById(editLabour.id);
          const data = response?.data || response;

          if (data) {
            setFetchedData({
              id: data.id,
              labourName: data.full_name,
              categoryId: data.category_id,
              assignProject: data.project_id,
              shiftTypeId: data.shift_type_id,
              countryCode: data.country_code,
              contactNumber: data.phone_number,
              phoneNumber: data.phone_number,
              defaultDailyWage: data.daily_wage,
              aadharNumber: data.aadhar_number,
              joinDate: data.join_date,
              profilePhoto: data.media?.profilePhoto || data.profile_photo || '',
              aadharCardPhoto: data.media?.aadharCard || data.aadhar_card_photo || '',
              insurancePhoto: data.media?.insurancePhoto || data.insurance_photo || '',
            });
          }
        } catch (error) {
          console.error("Failed to fetch labour details", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchLabour();
    }
  }, [isEdit, editLabour]);

  // Use fetched profile data if available, otherwise fall back to state data (which might be incomplete)
  const labourData = fetchedData || editLabour;

  const handleSubmit = async (payload) => {
    if (isEdit) {
      try {
        const idToUpdate = fetchedData?.id || editLabour?.id || labourData?.id;
        if (!idToUpdate) throw new Error('Labour ID not found for update');

        const fd = new FormData();
        fd.append('workspace_id', String(selectedWorkspace || ''));
        fd.append('role', 'labour');
        fd.append('labour_name', String(payload?.labourName || ''));
        fd.append('category_id', String(payload?.categoryId || ''));
        fd.append('project_id', String(payload?.assignProject || projectId || ''));
        fd.append('shift_type_id', String(payload?.shiftTypeId || ''));
        fd.append('country_code', String(payload?.countryCode || '+91'));

        // Strip any non-numeric characters from contact number to match image
        const cleanContactNumber = String(payload?.rawContactNumber || '').replace(/\D/g, '');
        fd.append('contact_number', cleanContactNumber);

        fd.append('daily_wage', String(payload?.defaultDailyWage || ''));
        fd.append('join_date', formatYYYYMMDD(payload?.joinDate));
        fd.append('labour_aadhar_number', String(payload?.aadharNumber || ''));

        const aadharFile = Array.isArray(payload?.aadharCardFiles) ? payload.aadharCardFiles[0] : null;
        const insuranceFile = Array.isArray(payload?.insuranceFiles) ? payload.insuranceFiles[0] : null;
        const profileFile = payload?.profilePhotoFile || null;

        // Only append files if they are new File objects (selected by user)
        if (aadharFile instanceof File) {
          fd.append('aadharCard', aadharFile);
        }
        if (insuranceFile instanceof File) {
          fd.append('insurancePhoto', insuranceFile);
        }
        if (profileFile instanceof File) {
          fd.append('profilePhoto', profileFile);
        }

        await updateLabour(idToUpdate, fd);
        showSuccess(t('addLabourForm.updatedSuccess', { defaultValue: 'Labour updated successfully' }));
        navigate(-1);
      } catch (err) {
        console.error('Error updating labour:', err);
        showError(err?.response?.data?.message || err?.message || t('addLabourForm.addFail', { defaultValue: 'Failed to update labour' }));
      }
      return;
    }

    try {
      const fd = new FormData();
      fd.append('workspace_id', String(selectedWorkspace || ''));
      fd.append('role', 'labour');
      fd.append('labour_name', String(payload?.labourName || ''));
      fd.append('category_id', String(payload?.categoryId || ''));
      fd.append('project_id', String(payload?.assignProject || projectId || ''));
      fd.append('shift_type_id', String(payload?.shiftTypeId || ''));
      fd.append('country_code', String(payload?.countryCode || '+91'));
      fd.append('contact_number', String(payload?.rawContactNumber || ''));
      fd.append('daily_wage', String(payload?.defaultDailyWage || ''));
      fd.append('join_date', formatYYYYMMDD(payload?.joinDate));
      fd.append('labour_aadhar_number', String(payload?.aadharNumber || ''));

      const aadharFile = Array.isArray(payload?.aadharCardFiles) ? payload.aadharCardFiles[0] : null;
      const insuranceFile = Array.isArray(payload?.insuranceFiles) ? payload.insuranceFiles[0] : null;
      const profileFile = payload?.profilePhotoFile || null;

      if (aadharFile) fd.append('aadharCard', aadharFile);
      if (insuranceFile) fd.append('insurancePhoto', insuranceFile);
      if (profileFile) fd.append('profilePhoto', profileFile);

      await addLabour(fd);
      showSuccess(t('addLabourForm.addedSuccess', { defaultValue: 'Labour added successfully' }));
      navigate(-1);
    } catch (err) {
      console.error('Error adding labour:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
      const errorMessage = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.message
        || t('addLabourForm.addFail', { defaultValue: 'Failed to add labour' });
      showError(errorMessage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title={isEdit ? t('common.editLabour') : t('common.addLabour')} onBack={() => navigate(-1)} />
      <AddLabourForm
        projectId={projectId}
        projectName={projectName}
        mode={isEdit ? 'edit' : 'add'}
        initialData={labourData}
        isLoading={isEdit && isLoading}
        onCancel={() => navigate(-1)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}


