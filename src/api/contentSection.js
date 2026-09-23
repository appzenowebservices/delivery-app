import apiClient from './apiClient';

export const getContentSection = (contentSectionType) => apiClient.get(`api/v1/client/content-section?type=${contentSectionType}`);
