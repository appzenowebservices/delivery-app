import apiClient from './apiClient';

export const getTrips = (query) => apiClient.get(`api/v1/delivery-partner/trip?${query}`);
export const patchTrips = (payload, config = {}) => {
	const normalizedPayload = {
		tripId: payload?.tripId,
		currentLocation: {
			lat: Number(payload?.currentLocation?.lat),
			lng: Number(payload?.currentLocation?.lng),
			updatedAt: payload?.currentLocation?.updatedAt || new Date().toISOString(),
		},
	};

	return apiClient.patch(`api/v1/delivery-partner/trip`, normalizedPayload, {
		timeout: 20000,
		...config,
	});
};
export const acceptRide = (payload) => {
	let normalizedPayload = payload;

	// if (payload && typeof payload === 'object') {
	// 	const tripId = payload.tripId || payload.id;
	// 	normalizedPayload = tripId ? { tripId } : payload;
	// } else if (payload) {
	// 	normalizedPayload = { tripId: payload };
	// }

	return apiClient.post(`api/v1/delivery-partner/trip/accept-ride`, normalizedPayload);
};
export const markedPickupArrival = (payload) => apiClient.post(`api/v1/delivery-partner/trip/mark-arrival-at-pickup`, payload);
export const markedPickupedUp = (payload) => apiClient.post(`api/v1/delivery-partner/trip/mark-picked-up`, payload);
export const markedDelivered = (payload) => apiClient.post(`api/v1/delivery-partner/trip/mark-delivered`, payload);
