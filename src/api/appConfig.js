import apiClient from './apiClient';

export const getAppConfig = () => apiClient.get('api/v1/delivery-partner/config');
