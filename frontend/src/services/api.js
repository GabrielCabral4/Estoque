import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços de produtos
export const productService = {
  getAll: () => api.get('/products/'),
  get: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  getLowStock: () => api.get('/products/low_stock/'),
  getMovements: (id) => api.get(`/products/${id}/movements/`),
};

// Serviços de categorias
export const categoryService = {
  getAll: () => api.get('/categories/'),
  get: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

// Serviços de fornecedores
export const supplierService = {
  getAll: () => api.get('/suppliers/'),
  get: (id) => api.get(`/suppliers/${id}/`),
  create: (data) => api.post('/suppliers/', data),
  update: (id, data) => api.put(`/suppliers/${id}/`, data),
  delete: (id) => api.delete(`/suppliers/${id}/`),
};

// Serviços de movimentação de estoque  
export const stockMovementService = {
  getAll: () => api.get('/stock-movements/'),
  get: (id) => api.get(`/stock-movements/${id}/`),
  create: (data) => api.post('/stock-movements/', data),
  update: (id, data) => api.put(`/stock-movements/${id}/`, data),
  delete: (id) => api.delete(`/stock-movements/${id}/`),
  getReport: (params) => api.get('/stock-movements/report/', { params }),
};

export default api;