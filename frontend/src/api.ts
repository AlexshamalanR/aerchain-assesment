import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// RFPs
export const rfpsAPI = {
  getAll: () => api.get('/rfps'),
  getById: (id: string) => api.get(`/rfps/${id}`),
  create: (description: string) => api.post('/rfps', { description }),
  send: (id: string, vendorIds: string[]) =>
    api.post(`/rfps/${id}/send`, { vendorIds }),
};

// Vendors
export const vendorsAPI = {
  getAll: () => api.get('/vendors'),
  getById: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors', data),
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
};

// Proposals
export const proposalsAPI = {
  getAll: () => api.get('/proposals'),
  getById: (id: string) => api.get(`/proposals/${id}`),
  create: (data: any) => api.post('/proposals', data),
  compare: (rfpId: string) => api.get(`/proposals/compare/${rfpId}`),
};

export default api;
