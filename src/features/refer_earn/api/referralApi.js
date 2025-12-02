import http from '../../../services/http';

// NOTE:
// config.API_BASE_URL already includes `/api`
// so here we only use the `/referral` segment to avoid `/api/api/...` URLs.
const BASE_PATH = '/referral';

export const getMyReferrals = () => {
  return http.get(`${BASE_PATH}/my-referrals`);
};

export const generateReferralLink = ({ referral_code, unique_number }) => {
  return http.post(`${BASE_PATH}/generate-link`, {
    referral_code,
    unique_number,
  });
};

export const shareReferralApi = ({ unique_number, shared_via }) => {
  return http.post(`${BASE_PATH}/share`, {
    unique_number,
    shared_via,
  });
};



