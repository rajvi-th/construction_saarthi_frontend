/**
 * Site Inventory Feature API Endpoints
 * All site inventory-related endpoints
 */

export const SITE_INVENTORY_ENDPOINTS = {
  // Site Inventory Endpoints
  SITE_INVENTORY: {
    LIST: '/site-inventory', // GET /site-inventory - List all items
    GET: '/site-inventory', // GET /site-inventory/{id} - Get single item
    CREATE: '/site-inventory/create',
    UPDATE: '/site-inventory/edit', // PUT /site-inventory/edit/{id}
    DELETE: '/site-inventory', // DELETE /site-inventory/{id} 
  },
};

// Flattened endpoints for easier access
export const SITE_INVENTORY_ENDPOINTS_FLAT = {
  // Site Inventory
  SITE_INVENTORY_LIST: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.LIST, // GET /site-inventory
  SITE_INVENTORY_GET: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.GET, // GET /site-inventory/{id}
  SITE_INVENTORY_CREATE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.CREATE,
  SITE_INVENTORY_UPDATE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.UPDATE, // PUT /site-inventory/edit/{id}
  SITE_INVENTORY_DELETE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.DELETE, // DELETE /site-inventory/{id}
};

export default SITE_INVENTORY_ENDPOINTS_FLAT;

