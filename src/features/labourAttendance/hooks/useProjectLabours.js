import { useCallback, useEffect, useState } from 'react';
import { getProjectLabours } from '../api/labourAttendanceApi';
import { showError } from '../../../utils/toast';

export const useProjectLabours = ({ workspaceId, projectId }) => {
  const [labours, setLabours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLabours = useCallback(async () => {
    if (!workspaceId || !projectId) {
      setLabours([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await getProjectLabours({ workspaceId, projectId });
      const list = res?.labours || res?.data?.labours || res?.data || res || [];
      setLabours(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error fetching labours:', e);
      showError(e?.response?.data?.message || e?.message || 'Failed to load labours');
      setLabours([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, projectId]);

  useEffect(() => {
    fetchLabours();
  }, [fetchLabours]);

  return { labours, isLoading, refetch: fetchLabours };
};

export default useProjectLabours;


