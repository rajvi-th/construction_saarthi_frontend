import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  User,
  Bell,
  Globe,
  Crown,
  Clock,
  Lock,
  LogOut,
  UserX,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../auth/store';
import PageHeader from '../../../components/layout/PageHeader';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { showError, showSuccess } from '../../../utils/toast';
import { ROUTES_FLAT } from '../../../constants/routes';
import { statusBadgeColors } from '../../../components/ui/StatusBadge';
import { useProfile } from '../hooks';

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Get avatar color
const getAvatarColor = (name) => {
  const colors = ['red', 'green', 'yellow', 'blue', 'purple', 'pink', 'darkblue'];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get avatar style
const getAvatarStyle = (color) => {
  const colorKey = color || 'red';
  const colors = statusBadgeColors[colorKey] || statusBadgeColors.red;
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };
};

// Format phone number
const formatPhone = (user) => {
  const countryCode = user?.country_code || user?.phone?.split(' ')[0] || '+91';
  const phone = user?.phone_number || user?.phone?.split(' ').slice(1).join('') || '';
  return phone ? `${countryCode} ${phone}` : 'N/A';
};

// Reusable Option Button Component
const OptionButton = ({ option, index, totalLength }) => {
  const isDanger = option.isDanger || false;
  
  return (
    <button
      onClick={option.onClick}
      className={`w-full flex items-center gap-3 sm:gap-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        index !== totalLength - 1 ? 'border-b border-gray-200' : ''
      } ${isDanger ? 'text-accent' : ''}`}
    >
      <div className={`flex-shrink-0 ${isDanger ? 'text-accent' : 'text-primary'}`}>
        {option.icon}
      </div>
      <span className={`flex-1 text-left text-sm sm:text-base ${
        isDanger ? 'text-accent' : 'text-primary'
      }`}>
        {option.label}
      </span>
      <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
        isDanger ? 'text-accent' : 'text-secondary'
      }`} />
    </button>
  );
};

export default function MyAccount() {
  const { t } = useTranslation('account');
  const { t: tCommon } = useTranslation('common');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch profile data to get profile picture
  const { profile } = useProfile();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Get profile picture from profile data or user data
  const profilePicture = profile?.profile || profile?.profile_picture || user?.profile || user?.profile_picture || null;

  const userName = user?.full_name || user?.name || profile?.full_name || 'User';
  const userPhone = formatPhone(user || profile);
  const avatarColor = getAvatarColor(userName);
  const avatarStyle = getAvatarStyle(avatarColor);
  const initials = getInitials(userName);

  // Settings options
  const settingsOptions = [
    {
      id: 'profile',
      label: t('settings.myProfile', { defaultValue: 'My Profile' }),
      icon: <User className="w-5 h-5" />,
      onClick: () => {
        navigate(ROUTES_FLAT.MY_PROFILE);
      },
    },
    // {
    //   id: 'notifications',
    //   label: t('settings.manageNotifications', { defaultValue: 'Manage Notifications' }),
    //   icon: <Bell className="w-5 h-5" />,
    //   onClick: () => {
    //     // TODO: Navigate to notifications page
    //     showError('Feature coming soon');
    //   },
    // },
    {
      id: 'language',
      label: t('settings.changeLanguage', { defaultValue: 'Change Language' }),
      icon: <Globe className="w-5 h-5" />,
      onClick: () => {
        navigate(ROUTES_FLAT.CHANGE_LANGUAGE);
      },
    },
    {
      id: 'subscription',
      label: t('settings.mySubscription', { defaultValue: 'My Subscription' }),
      icon: <Crown className="w-5 h-5" />,
      onClick: () => {
        navigate(ROUTES_FLAT.SUBSCRIPTION);
      },
    },
  ];

  // Security options
  const securityOptions = [
    {
      id: 'terms',
      label: t('security.termsAndConditions', { defaultValue: 'Terms and Conditions' }),
      icon: <Clock className="w-5 h-5" />,
      onClick: () => {
        // TODO: Navigate to terms page
        showError('Feature coming soon');
      },
    },
    {
      id: 'privacy',
      label: t('security.privacyPolicy', { defaultValue: 'Privacy Policy' }),
      icon: <Lock className="w-5 h-5" />,
      onClick: () => {
        // TODO: Navigate to privacy page
        showError('Feature coming soon');
      },
    },
    {
      id: 'signout',
      label: tCommon('sidebarHeader.logout', { defaultValue: 'Log Out' }),
      icon: <LogOut className="w-5 h-5" />,
      onClick: () => setIsLogoutModalOpen(true),
    },
    {
      id: 'delete',
      label: t('security.deleteAccount', { defaultValue: 'Delete Account' }),
      icon: <UserX className="w-5 h-5" />,
      onClick: () => setIsDeleteModalOpen(true),
      isDanger: true,
    },
  ];

  const handleSignOut = () => {
    logout();
    navigate(ROUTES_FLAT.LOGIN);
    showSuccess(tCommon('successMessages.loggedOut', { defaultValue: 'Logged out successfully' }));
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account API
    showError('Feature coming soon');
    setIsDeleteModalOpen(false);
  };

  const handleProfilePhotoChange = () => {
    // TODO: Implement profile photo upload
    showError('Feature coming soon');
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={t('title', { defaultValue: 'My Account' })}
          showBackButton={false}
        />

        {/* User Profile Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col items-center">
            {/* Avatar with Camera Icon */}
            <div className="relative mb-4 sm:mb-5">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-semibold text-xl sm:text-2xl md:text-3xl border-2 flex-shrink-0"
                style={avatarStyle}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-1 sm:mb-2">
              {userName}
            </h2>

            {/* Phone Number */}
            <p className="text-sm sm:text-base text-secondary">
              {userPhone}
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xs sm:text-sm font-medium text-secondary mb-3 sm:mb-4 px-1">
            {t('settings.title', { defaultValue: 'Settings' })}
          </h3>
          <div>
            {settingsOptions.map((option, index) => (
              <OptionButton
                key={option.id}
                option={option}
                index={index}
                totalLength={settingsOptions.length}
              />
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary mb-3 sm:mb-4 px-1">
            {t('security.title', { defaultValue: 'Security' })}
          </h3>
          <div>
            {securityOptions.map((option, index) => (
              <OptionButton
                key={option.id}
                option={option}
                index={index}
                totalLength={securityOptions.length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Log Out Confirmation Modal */}
      {isLogoutModalOpen && (
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleSignOut}
          title={tCommon('sidebarHeader.logoutConfirm.title', { defaultValue: 'Log Out' })}
          message={tCommon('sidebarHeader.logoutConfirm.message', { defaultValue: 'Are you sure you want to log out?' })}
          confirmText={tCommon('sidebarHeader.logout', { defaultValue: 'Log out' })}
          cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
          confirmVariant="primary"
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          title={t('security.deleteAccount', { defaultValue: 'Delete Account' })}
          message={t('security.deleteAccountConfirm', { defaultValue: 'Are you sure you want to delete your account? This action cannot be undone.' })}
          confirmText={tCommon('delete', { defaultValue: 'Delete' })}
          cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
          confirmVariant="danger"
        />
      )}
    </>
  );
}

