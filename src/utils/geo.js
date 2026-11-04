const toRad = (value) => (value * Math.PI) / 180;

export const haversineKm = (from, to) => {
  if (!from || !to) return null;

  const lat1 = Number(from.lat ?? from.latitude);
  const lng1 = Number(from.lng ?? from.longitude);
  const lat2 = Number(to.lat ?? to.latitude);
  const lng2 = Number(to.lng ?? to.longitude);

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const parseDistanceKm = (value) => {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const text = String(value);
  const km = text.match(/([\d.]+)\s*km/i);
  if (km) return Number(km[1]);

  const meters = text.match(/([\d.]+)\s*m\b/i);
  if (meters) return Number(meters[1]) / 1000;

  return null;
};

const parseMinutes = (value) => {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const match = String(value).match(/([\d.]+)\s*min/i);
  return match ? Number(match[1]) : null;
};

export const formatKm = (km) => {
  if (!Number.isFinite(km) || km <= 0) return null;
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;
};

/**
 * Distance / ETA for a trip, falling back to the pickup/drop-off coordinates
 * when the API did not provide estimates.
 */
export const getTripMetrics = (trip) => {
  let distanceKm = parseDistanceKm(trip?.estimatedDistance);

  if (!distanceKm) {
    const directKm = haversineKm(trip?.pickupLocation, trip?.dropoffLocation);
    if (directKm) distanceKm = directKm * 1.3; // road-distance approximation
  }

  let etaMin = parseMinutes(trip?.estimatedTime);
  if (!etaMin && distanceKm) {
    etaMin = Math.max(1, Math.round((distanceKm / 22) * 60)); // ~22 km/h city speed
  }

  return {
    distanceKm,
    distanceLabel: formatKm(distanceKm) || '--',
    etaLabel: etaMin ? `${Math.round(etaMin)} min` : '--',
  };
};
