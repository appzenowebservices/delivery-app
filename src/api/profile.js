import apiClient from './apiClient';

export const getProfile = () => apiClient.get(`api/v1/delivery-partner/profile`,




    // {
    //     headers: {
    //         Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTYzODQyMDAsImV4cCI6MTc5MjM4NDIwMH0.kATXBZzTxsZ7AiVg-iiFZFBVIXRm6iRic2mKt3kxSLQ`,
    //     },
    // }



);
export const patchProfile = (id, payload) =>
    apiClient.patch(`api/v1/delivery-partner/profile/${id}`, payload);
export const postFcmToken = (payload) => apiClient.post(`api/v1/delivery-partner/profile/fcm-token`, payload);
