/**
 * API Configuration and Base Functions
 * Ready for backend integration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Generic API request handler with error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} - API response data
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Call Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET request wrapper
 */
export function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiCall(url, { method: 'GET' });
}

/**
 * POST request wrapper
 */
export function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request wrapper
 */
export function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request wrapper
 */
export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

// ============================================
// PRODUCT ENDPOINTS
// ============================================

export const productAPI = {
  // Get all products with pagination
  getAll: (page = 1, limit = 10, search = '') => 
    apiGet('/products', { page, limit, ...(search && { search }) }),

  // Get single product
  getById: (id) => 
    apiGet(`/products/${id}`),

  // Create product
  create: (productData) => 
    apiPost('/products', productData),

  // Update product
  update: (id, productData) => 
    apiPut(`/products/${id}`, productData),

  // Delete product
  delete: (id) => 
    apiDelete(`/products/${id}`),
};

// ============================================
// CUSTOMER ENDPOINTS
// ============================================

export const customerAPI = {
  // Get all customers with pagination
  getAll: (page = 1, limit = 10, search = '', status = '') => 
    apiGet('/customers', { page, limit, ...(search && { search }), ...(status && { status }) }),

  // Get single customer
  getById: (id) => 
    apiGet(`/customers/${id}`),

  // Create customer
  create: (customerData) => 
    apiPost('/customers', customerData),

  // Update customer
  update: (id, customerData) => 
    apiPut(`/customers/${id}`, customerData),

  // Delete customer
  delete: (id) => 
    apiDelete(`/customers/${id}`),
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

export const dashboardAPI = {
  // Get overview metrics
  getOverview: () => 
    apiGet('/dashboard/overview'),
};

// ============================================
// BATCH OPERATIONS (Future)
// ============================================

export async function batchGetProducts(ids) {
  return Promise.all(ids.map(id => productAPI.getById(id)));
}

export async function batchDeleteProducts(ids) {
  return Promise.all(ids.map(id => productAPI.delete(id)));
}

export async function batchGetCustomers(ids) {
  return Promise.all(ids.map(id => customerAPI.getById(id)));
}

export async function batchDeleteCustomers(ids) {
  return Promise.all(ids.map(id => customerAPI.delete(id)));
}
