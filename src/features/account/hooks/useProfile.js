import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/store';

/**
 * Custom hook for fetching and managing user profile
 * @returns {Object} { profile, isLoading, isSaving, error, refetch, updateProfile }
 */
export const useProfile = () => {
  const { t: tCommon } = useTranslation('common');
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserProfile();

      // Handle different response structures
      const responseData = response?.data || response || null;
      
      // Merge user_detail with main profile data if user_detail exists
      let profileData = responseData;
      if (responseData?.user_detail) {
        profileData = {
          ...responseData,
          ...responseData.user_detail, 
        };
        delete profileData.user_detail;
      }
      
      console.log('Merged Profile Data:', profileData);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load profile data';
      setError(errorMessage);
      showError(errorMessage);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (formData) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await updateUserProfile(formData);
      // Response interceptor already returns response.data, so response is the data itself
      const updatedUser = response;

      // Update user in auth store if response contains user data
      if (updatedUser) {
        const currentUser = { ...user, ...updatedUser };
        login(currentUser, localStorage.getItem('token'));
      }

      // Update local profile state
      setProfile((prev) => ({ ...prev, ...updatedUser }));

      showSuccess(
        tCommon('successMessages.saved', {
          defaultValue: 'Profile saved successfully',
        })
      );
      return updatedUser;
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err?.response);
      console.error('Error data:', err?.response?.data);
      
      // Extract error message from response
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update profile. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [user, login, tCommon]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};

export default useProfile;

