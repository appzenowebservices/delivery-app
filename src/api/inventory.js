import apiClient from './apiClient';

export const getInventoryById = (inventoryId) => apiClient.get(`/api/v1/client/inventory?inventoryId=${inventoryId}`);
