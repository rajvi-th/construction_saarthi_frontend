import { useCallback, useEffect, useState } from 'react';
import { createCategory, getCategories } from '../api/labourAttendanceApi';
import { showError, showSuccess } from '../../../utils/toast';

export const useCategories = (workspaceId) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!workspaceId) {
      setCategories([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await getCategories(workspaceId);
      const list = res?.categories || res?.data?.categories || res?.data || res || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error fetching categories:', e);
      showError(e?.response?.data?.message || e?.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const addNewCategory = useCallback(
    async (name) => {
      if (!workspaceId) return null;
      try {
        const res = await createCategory({ workspace_id: workspaceId, name, categoryId: '' });
        showSuccess('Category created successfully');
        await fetchCategories();

        const created =
          res?.category ||
          res?.data?.category ||
          res?.data ||
          res;
        return created || null;
      } catch (e) {
        console.error('Error creating category:', e);
        showError(e?.response?.data?.message || e?.message || 'Failed to create category');
        return null;
      }
    },
    [workspaceId, fetchCategories]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, refetch: fetchCategories, addNewCategory };
};

export default useCategories;


