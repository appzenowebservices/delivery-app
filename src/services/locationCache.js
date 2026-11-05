let lastLocation = null;
const listeners = new Set();

export const setLastLocation = (coords) => {
  if (!coords) return;

  const lat = Number(coords.lat ?? coords.latitude);
  const lng = Number(coords.lng ?? coords.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  lastLocation = {
    lat,
    lng,
    accuracy: coords.accuracy,
    updatedAt: Date.now(),
  };

  listeners.forEach((listener) => {
    try {
      listener(lastLocation);
    } catch (error) {
      // ignore listener failures
    }
  });
};

export const getLastLocation = () => lastLocation;

export const subscribeLocation = (listener) => {
  listeners.add(listener);
  if (lastLocation) listener(lastLocation);

  return () => listeners.delete(listener);
};
