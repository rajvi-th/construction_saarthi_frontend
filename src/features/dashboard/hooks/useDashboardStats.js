import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '../api/dashboardApi';
import { showError } from '../../../utils/toast';

export const useDashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getDashboardStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (e) {
            console.error('Error fetching dashboard statistics:', e);
            showError(e?.response?.data?.message || e?.message || 'Failed to load dashboard statistics');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
};

export default useDashboardStats;
