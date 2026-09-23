import apiClient from './apiClient';

export const login = (mobile) => apiClient.post(`api/v1/delivery-partner/auth/mobile-login`, { mobile });
