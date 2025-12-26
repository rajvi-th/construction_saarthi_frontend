import { useCallback, useEffect, useState } from 'react';
import { getLabourProfile } from '../api/labourAttendanceApi';
import { showError } from '../../../utils/toast';

export const useLabourProfile = ({ workspaceId, labourId }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!workspaceId || !labourId) {
      setProfile(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await getLabourProfile({ workspaceId, labourId });
      const data = res?.data || res?.profile || res?.labour || res;
      setProfile(data || null);
    } catch (e) {
      console.error('Error fetching labour profile:', e);
      showError(e?.response?.data?.message || e?.message || 'Failed to fetch labour profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, labourId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, refetch: fetchProfile };
};

export default useLabourProfile;


