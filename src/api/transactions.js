import apiClient from './apiClient';

export const getTransactionsOverview = () => apiClient.get(`/api/v1/delivery-partner/transaction`);
export const getRideHistory = () => apiClient.get(`/api/v1/delivery-partner/transaction`);

export const getPayments = () => apiClient.get(`/api/v1/delivery-partner/transaction`);
