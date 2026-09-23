import apiClient from './apiClient';

export const getCategory = (module) => apiClient.get(`/api/v1/client/category?module=${module}`);
