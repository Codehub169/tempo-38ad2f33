import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message || error);
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Token might be invalid or expired.');
      // Further handling like redirecting to login can be done in AuthContext or components
    }
    return Promise.reject(error);
  }
);

// Product endpoints
export const getProducts = async (filters = {}) => {
  try {
    // Destructure expected filter keys, backend uses minPrice, maxPrice
    const { category, condition, minPrice, maxPrice, search, limit, page, sortBy, sortOrder } = filters;
    const params = new URLSearchParams();
    if (category && String(category).toLowerCase() !== 'all') params.append('category', category);
    if (condition && String(condition).toLowerCase() !== 'all') params.append('condition', condition);
    if (minPrice !== undefined) params.append('minPrice', minPrice);
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data; 
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    // Rethrow to be handled by the calling component (e.g., display toast)
    throw error;
  }
};

// Order endpoints
export const createOrder = async (orderDetails) => {
  try {
    const response = await apiClient.post('/orders', orderDetails);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw error;
  }
};

// Auth endpoints
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/products/categories');
    return response.data; 
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error; 
  }
};

export default apiClient;
