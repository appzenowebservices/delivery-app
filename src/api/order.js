import apiClient from './apiClient';

export const patchOrder = (orderId) => apiClient.patch(`api/v1/delivery-partner/order`, {
    orderId,
    orderStatus: 'assigned'
});
