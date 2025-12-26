import { useCallback, useEffect, useState } from 'react';
import { getShiftTypes } from '../api/labourAttendanceApi';
import { showError } from '../../../utils/toast';

export const useShiftTypes = () => {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShiftTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getShiftTypes();
      const list = res?.shiftTypes || res?.data?.shiftTypes || res?.data || res || [];
      setShiftTypes(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error fetching shift types:', e);
      showError(e?.response?.data?.message || e?.message || 'Failed to load shift types');
      setShiftTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShiftTypes();
  }, [fetchShiftTypes]);

  return { shiftTypes, isLoading, refetch: fetchShiftTypes };
};

export default useShiftTypes;


