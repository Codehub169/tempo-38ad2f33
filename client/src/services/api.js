import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api'; // Use environment variable or default

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for API responses (optional, for global error handling or logging)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed
    console.error('API Error:', error.response || error.message || error);
    // You could potentially redirect to an error page or show a global notification
    return Promise.reject(error);
  }
);

// Product endpoints
export const getProducts = async (filters = {}) => {
  try {
    const { category, condition, price_min, price_max, search } = filters;
    const params = new URLSearchParams();
    if (category && category.toLowerCase() !== 'all') params.append('category', category);
    if (condition) params.append('condition', condition);
    if (price_min) params.append('price_min', price_min);
    if (price_max) params.append('price_max', price_max);
    if (search) params.append('search', search);

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Re-throw to be caught by the calling component
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

// Mock function for categories, if not fetched from backend
export const getCategories = async () => {
  // In a real app, this would fetch from '/api/categories'
  return Promise.resolve([
    { id: 'mobiles', name: 'Mobiles' },
    { id: 'tvs', name: 'TVs' },
    { id: 'laptops', name: 'Laptops' },
    { id: 'fridges', name: 'Fridges' },
    { id: 'acs', name: 'ACs' },
    { id: 'appliances', name: 'Appliances' },
  ]);
};

export default apiClient;
