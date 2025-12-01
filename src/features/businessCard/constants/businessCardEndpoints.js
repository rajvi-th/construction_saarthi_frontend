/**
 * Business Card Feature API Endpoints
 * All business card-related endpoints
 */

export const BUSINESS_CARD_ENDPOINTS = {
  // Business Card Endpoints
  BUSINESS_CARD: {
    LIST: '/business-card', // GET /business-card - List all cards
    GET: '/business-card', // GET /business-card/{id} - Get single card
    CREATE: '/business-card/create',
    UPDATE: '/business-card/edit', // PUT /business-card/edit/{id}
    DELETE: '/business-card', // DELETE /business-card/{id} 
  },
};

// Flattened endpoints for easier access
export const BUSINESS_CARD_ENDPOINTS_FLAT = {
  // Business Card
  BUSINESS_CARD_LIST: BUSINESS_CARD_ENDPOINTS.BUSINESS_CARD.LIST, // GET /business-card
  BUSINESS_CARD_GET: BUSINESS_CARD_ENDPOINTS.BUSINESS_CARD.GET, // GET /business-card/{id}
  BUSINESS_CARD_CREATE: BUSINESS_CARD_ENDPOINTS.BUSINESS_CARD.CREATE,
  BUSINESS_CARD_UPDATE: BUSINESS_CARD_ENDPOINTS.BUSINESS_CARD.UPDATE, // PUT /business-card/edit/{id}
  BUSINESS_CARD_DELETE: BUSINESS_CARD_ENDPOINTS.BUSINESS_CARD.DELETE, // DELETE /business-card/{id}
};

export default BUSINESS_CARD_ENDPOINTS_FLAT;

