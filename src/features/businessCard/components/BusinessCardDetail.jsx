import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, MoreVertical, ArrowLeftRight, User, Phone, Mail, MapPin, Share2, Download, Trash2     } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import { ROUTES_FLAT } from '../../../constants/routes';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { showSuccess, showError } from '../../../utils/toast';

export default function BusinessCardDetail({ businessCard, onDelete }) {
  const { t } = useTranslation('businessCard');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    navigate(ROUTES_FLAT.EDIT_BUSINESS_CARD.replace(':id', businessCard.id || businessCard._id));
  };

  const handleShare = async () => {
    try {
      // Create shareable data
      const cardData = {
        companyName: companyName,
        fullName: fullName,
        email: email,
        phone: phone,
        address: address,
        tagline: tagline,
      };

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `${companyName} - Business Card`,
          text: `Contact: ${fullName}\nPhone: ${phone}\nEmail: ${email}${address ? `\nAddress: ${address}` : ''}`,
          url: window.location.href,
        });
        showSuccess(t('shareSuccess', { defaultValue: 'Business card shared successfully!' }));
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${companyName}\n${fullName}\nPhone: ${phone}\nEmail: ${email}${address ? `\nAddress: ${address}` : ''}`;
        await navigator.clipboard.writeText(shareText);
        showSuccess(t('shareCopied', { defaultValue: 'Business card details copied to clipboard!' }));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showError(t('shareError', { defaultValue: 'Failed to share business card.' }));
      }
    }
  };

  const handleDownload = async () => {
    try {
      // Get the card element
      const cardElement = document.querySelector('[data-business-card]');
      if (!cardElement) {
        showError(t('downloadError', { defaultValue: 'Failed to find business card element.' }));
        return;
      }
      showSuccess(t('downloadSuccess', { defaultValue: 'Business card download started!' }));
    } catch (error) {
      showError(t('downloadError', { defaultValue: 'Failed to download business card.' }));
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (onDelete && businessCard.id) {
      await onDelete(businessCard.id || businessCard._id);
    }
    setShowDeleteModal(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Parse company tagline HTML to extract text
  const getTaglineText = (htmlTagline) => {
    if (!htmlTagline) return '';
    // Remove HTML tags and extract text
    const div = document.createElement('div');
    div.innerHTML = htmlTagline;
    return div.textContent || div.innerText || '';
  };

  const companyName = businessCard?.companyName || businessCard?.company_name || '';
  const tagline = getTaglineText(businessCard?.companyTagline || businessCard?.company_tagline || '');
  const logo =  businessCard?.logoUrl || '';
  const firstName = businessCard?.firstName || businessCard?.first_name || '';
  const lastName = businessCard?.lastName || businessCard?.last_name || '';
  const fullName = businessCard?.full_name || `${firstName} ${lastName}`.trim() || '';
  const email = businessCard?.email || '';
  const phone = businessCard?.phoneNumber || businessCard?.phone_number || '';
  const address = businessCard?.address || '';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-primary">
          {t('title', { defaultValue: 'Business Card' })}
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleEdit}
            leftIconName="Edit"
            className="text-accent flex-1 sm:flex-initial"
          >
            {t('edit.title', { defaultValue: 'Edit Card' })}
          </Button>
          <DropdownMenu
            items={[
              {
                label: t('shareCard', { defaultValue: 'Share Card' }),
                onClick: handleShare,
                icon: <Share2 className="w-4 h-4" />,
                iconClassName: 'text-primary',
              },
              {
                label: t('downloadCard', { defaultValue: 'Download Card' }),
                onClick: handleDownload,
                icon: <Download className="w-4 h-4" />,
                iconClassName: 'text-primary',
              },
              {
                label: tCommon('delete', { defaultValue: 'Delete' }),
                onClick: handleDelete,
                icon: <Trash2 className="w-4 h-4 text-accent" />, 
                textColor: 'text-accent',
              },
            ]}
          />
        </div>
      </div>

      {/* Business Card View */}
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] px-2 sm:px-4 w-full">
        {/* View Label */}
        <div className="w-full max-w-2xl mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">
            {isFlipped ? t('backView', { defaultValue: 'Back View' }) : t('frontView', { defaultValue: 'Front View' })}
          </h2>
        </div>

        {/* Business Card */}
        <div className="relative w-full max-w-2xl mb-6 sm:mb-8 mx-auto">
          <div
            data-business-card
            className="relative w-full h-[240px] sm:h-[280px] bg-[#F9F4EE] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-[3px] sm:border-[4.83px] border-[#E7D7C133]"
            style={{
              perspective: '500px',
            }}
          >
            <div
              className="relative w-full h-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front View */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full px-2">
                  {/* Logo */}
                  {logo && (
                    <div className="mb-3 sm:mb-4">
                      <img
                        src={logo}
                        alt="Company Logo"
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                      />
                    </div>
                  )}

                  {/* Company Name */}
                  {companyName && (
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary text-center mb-2 sm:mb-3 px-2">
                      {companyName}
                    </h3>
                  )}

                  {/* Tagline */}
                  {tagline && (
                    <p className="text-xs sm:text-sm text-secondary text-center max-w-md px-2 sm:px-4 break-words">
                      {tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Back View */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Back side layout
                  - Mobile: full-width contact block, vertically centered with no extra top/bottom padding
                  - Desktop: logo/brand left, contact details right
                */}
                <div className="flex flex-col sm:flex-row h-full px-3 sm:px-6 py-6 sm:py-0">
                  {/* Left Side - Logo and Company Name (Hidden on mobile) */}
                  <div className="hidden sm:flex flex-col justify-center w-1/2 pr-4 border-r-[3px] border-[#B02E0C14]">
                    {/* Logo */}
                    {logo && (
                      <div className="mb-6 sm:mb-0 flex justify-center">
                        <img
                          src={logo}
                          alt="Company Logo"
                          className="w-12 h-12 sm:w-20 sm:h-20 md:w-40 md:h-30 object-contain"
                        />
                      </div>
                    )}

                    {/* Company Name - Single line */}
                    {companyName && (
                      <div className="text-left sm:text-center">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary leading-tight">
                          {companyName}
                        </h3>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Contact Information with Icons */}
                  <div className="flex flex-col items-center justify-center w-full sm:w-1/2 sm:items-start sm:pl-4 space-y-2 sm:space-y-3">
                    {[
                      { icon: User, value: fullName, key: 'name' },
                      { icon: Phone, value: phone, key: 'phone' },
                      { icon: Mail, value: email, key: 'email' },
                      { icon: MapPin, value: address, key: 'address' },
                    ]
                      .filter((item) => item.value)
                      .map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-center sm:justify-start gap-2 sm:pl-4"
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                            <p className="text-sm sm:text-base md:text-lg text-primary break-words text-center sm:text-left">
                              {item.value}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleFlip}
          leftIconName="ArrowLeftRight"
          className="bg-[#8B4513] hover:bg-[#6B3410] w-full sm:w-auto"
          iconSize="w-4.5 h-4.5"
        >
          {isFlipped
            ? t('flipToFront', { defaultValue: 'Flip to Front' })
            : t('flipToBack', { defaultValue: 'Flip to Backside' })}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t('deleteConfirmation.title', { defaultValue: 'Delete Business Card' })}
        message={t('deleteConfirmation.message', { defaultValue: 'Are you sure you want to delete this business card? This action cannot be undone.' })}
        confirmText={tCommon('delete', { defaultValue: 'Delete' })}
        cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
      />
    </div>
  );
}

