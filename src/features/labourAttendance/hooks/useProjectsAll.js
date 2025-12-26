import { useCallback, useEffect, useState } from 'react';
import { getProjectsAll } from '../api/labourAttendanceApi';
import { showError } from '../../../utils/toast';

export const useProjectsAll = (workspaceId) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!workspaceId) {
      setProjects([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await getProjectsAll(workspaceId);
      const list = res?.projects || res?.data?.projects || res?.data || res || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error fetching projects:', e);
      showError(e?.response?.data?.message || e?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, refetch: fetchProjects };
};

export default useProjectsAll;


