/**
 * Site Inventory Feature API Endpoints
 * All site inventory-related endpoints
 */

export const SITE_INVENTORY_ENDPOINTS = {
  // Site Inventory Endpoints
  SITE_INVENTORY: {
    LIST: '/inventoryItem/inventory/list', // GET /inventoryItem/inventory/list?projectID=12&inventoryTypeId=2
    GET: '/site-inventory', // GET /site-inventory/{id} - Get single item
    CREATE: '/inventoryItem/create', // POST /inventoryItem/create
    UPDATE: '/site-inventory/edit', // PUT /site-inventory/edit/{id}
    DELETE: '/site-inventory', // DELETE /site-inventory/{id}
    TRANSFER_REQUESTS: '/inventoryItem/transferRequests', // GET /inventoryItem/transferRequests?scope=incoming&projectID=23
    TRANSFER_APPROVE: '/inventoryItem/transferRequest/approve', // POST /inventoryItem/transferRequest/approve/:transferRequestId
    TRANSFER_REJECT: '/inventoryItem/transferRequest/reject', // POST /inventoryItem/transferRequest/reject/:workspaceID
    ASK_MATERIAL_REQUESTS: '/inventoryItem/askMaterialRequests', // GET /inventoryItem/askMaterialRequests?projectID=23
    REQUEST_MATERIAL: '/inventoryItem/requestMaterial', // POST /inventoryItem/requestMaterial
    RESTOCK_MATERIAL: '/inventoryItem/restockMaterial', // POST /inventoryItem/restockMaterial
    RESTOCK_REQUESTS: '/inventoryItem/restockRequests', // GET /inventoryItem/restockRequests?projectID=29&requestStatus=active&inventoryTypeId=2
    DESTROYED_MATERIALS: '/inventoryItem/destroyedMaterials', // GET /inventoryItem/destroyedMaterials?projectID=23
  },
  // Materials Endpoints
  MATERIALS: {
    LIST: '/material', // GET /materials/all/:workspaceid - List all materials
    CREATE: '/material/create', // POST /materials/create - Create new material
  },
  // Units Endpoints
  UNITS: {
    LIST: '/unit/all', // GET /unit/all/:workspaceid - List all units
    CREATE: '/unit/create', // POST /unit/create - Create new unit
  },
  // Vendors Endpoints
  VENDORS: {
    LIST: '/vendors', // GET /vendors - List all vendors
    CREATE: '/vendors/create', // POST /vendors/create - Create new vendor
  },
  // Inventory Types Endpoints
  INVENTORY_TYPES: {
    LIST: '/inventory/all', // GET /inventory/all - List all inventory types
  },
};

// Flattened endpoints for easier access
export const SITE_INVENTORY_ENDPOINTS_FLAT = {
  // Site Inventory
  SITE_INVENTORY_LIST: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.LIST, // GET /inventoryItem/inventory/list
  SITE_INVENTORY_GET: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.GET, // GET /site-inventory/{id}
  SITE_INVENTORY_CREATE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.CREATE,
  SITE_INVENTORY_UPDATE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.UPDATE, // PUT /site-inventory/edit/{id}
  SITE_INVENTORY_DELETE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.DELETE, // DELETE /site-inventory/{id}
  SITE_INVENTORY_TRANSFER_REQUESTS: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.TRANSFER_REQUESTS, // GET /inventoryItem/transferRequests
  SITE_INVENTORY_TRANSFER_APPROVE: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.TRANSFER_APPROVE, // POST /inventoryItem/transferRequest/approve/:workspaceID
  SITE_INVENTORY_TRANSFER_REJECT: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.TRANSFER_REJECT, // POST /inventoryItem/transferRequest/reject/:workspaceID
  SITE_INVENTORY_ASK_MATERIAL_REQUESTS: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.ASK_MATERIAL_REQUESTS, // GET /inventoryItem/askMaterialRequests
  SITE_INVENTORY_REQUEST_MATERIAL: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.REQUEST_MATERIAL, // POST /inventoryItem/requestMaterial
  SITE_INVENTORY_RESTOCK_MATERIAL: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.RESTOCK_MATERIAL, // POST /inventoryItem/restockMaterial
  SITE_INVENTORY_RESTOCK_REQUESTS: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.RESTOCK_REQUESTS, // GET /inventoryItem/restockRequests
  SITE_INVENTORY_DESTROYED_MATERIALS: SITE_INVENTORY_ENDPOINTS.SITE_INVENTORY.DESTROYED_MATERIALS, // GET /inventoryItem/destroyedMaterials
  // Materials
  MATERIALS_LIST: SITE_INVENTORY_ENDPOINTS.MATERIALS.LIST, // GET /materials
  MATERIALS_CREATE: SITE_INVENTORY_ENDPOINTS.MATERIALS.CREATE, // POST /materials/create
  // Units
  UNITS_LIST: SITE_INVENTORY_ENDPOINTS.UNITS.LIST, // GET /unit/all/:workspaceid
  UNITS_CREATE: SITE_INVENTORY_ENDPOINTS.UNITS.CREATE, // POST /unit/create
  // Vendors
  VENDORS_LIST: SITE_INVENTORY_ENDPOINTS.VENDORS.LIST, // GET /vendors
  VENDORS_CREATE: SITE_INVENTORY_ENDPOINTS.VENDORS.CREATE, // POST /vendors/create
  // Inventory Types
  INVENTORY_TYPES_LIST: SITE_INVENTORY_ENDPOINTS.INVENTORY_TYPES.LIST, // GET /inventory/all
};

export default SITE_INVENTORY_ENDPOINTS_FLAT;

