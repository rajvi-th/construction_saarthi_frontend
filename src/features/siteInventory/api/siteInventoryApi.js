/**
 * Site Inventory API
 * API calls for site inventory management
 */

import http from '../../../services/http';
import { SITE_INVENTORY_ENDPOINTS_FLAT } from '../constants/siteInventoryEndpoints';

/**
 * Create site inventory item
 * @param {Object} data - Site inventory data
 * @returns {Promise<Object>} API response
 */
export const createSiteInventory = async (data) => {
  const formData = new FormData();

  // Append all fields from data
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  return http.post(
    SITE_INVENTORY_ENDPOINTS_FLAT.SITE_INVENTORY_CREATE,
    formData
  );
};

/**
 * Get site inventory item details
 * @param {string} id - Site inventory item ID
 * @returns {Promise<Object>} Site inventory data
 */
export const getSiteInventory = async (id) => {
  return http.get(`${SITE_INVENTORY_ENDPOINTS_FLAT.SITE_INVENTORY_GET}/${id}`);
};

/**
 * Update site inventory item
 * @param {string} id - Site inventory item ID
 * @param {Object} data - Site inventory data
 * @returns {Promise<Object>} API response
 */
export const updateSiteInventory = async (id, data) => {
  const formData = new FormData();

  // Append all fields from data
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  return http.put(
    `${SITE_INVENTORY_ENDPOINTS_FLAT.SITE_INVENTORY_UPDATE}/${id}`,
    formData
  );
};

/**
 * Delete site inventory item
 * @param {string} id - Site inventory item ID
 * @returns {Promise<Object>} API response
 */
export const deleteSiteInventory = async (id) => {
  return http.delete(`${SITE_INVENTORY_ENDPOINTS_FLAT.SITE_INVENTORY_DELETE}/${id}`);
};

/**
 * Get list of site inventory items
 * @returns {Promise<Object>} List of site inventory items
 */
export const getSiteInventoryList = async () => {
  return http.get(SITE_INVENTORY_ENDPOINTS_FLAT.SITE_INVENTORY_LIST);
};

