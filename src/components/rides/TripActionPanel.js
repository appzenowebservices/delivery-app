// components/rides/TripActionPanel.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Vibration,
  Linking,
  PermissionsAndroid,
  Platform,
} from "react-native";
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  markedDelivered,
  markedPickupArrival,
  markedPickupedUp,
} from "../../api/trips";
import SlideToAccept from "./SlideToAccept";
import {
  getLastLocation,
  setLastLocation,
  subscribeLocation,
} from "../../services/locationCache";

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f', // Emerald
  warning: '#e9c46a', // Amber
  bg: '#fdfbf7',
};

// 100 meters for "Arrived" / "Delivered" proximity
const PROXIMITY_THRESHOLD_METERS = 100;

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return null;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371e3; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TripActionPanel = ({ trip, currentLocation, onTripStatusUpdate, onStopLocationTracking }) => {
  const initialLocation = getLastLocation() || currentLocation || null;
  const [internalLocation, setInternalLocation] = useState(initialLocation);
  const [gpsState, setGpsState] = useState(initialLocation ? 'ready' : 'locating');
  const [inlineError, setInlineError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    let mounted = true;
    let retryTimer = null;
    let attempts = 0;

    const applyPosition = (pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };

      setLastLocation(coords);
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (!mounted) return;

      setInternalLocation(coords);
      setGpsState('ready');
      setInlineError('');
    };

    const handleError = (err) => {
      console.log('Location Error:', err);
      if (!mounted) return;
      setGpsState((prev) => (prev === 'ready' ? prev : err?.code === 1 ? 'denied' : 'weak'));
    };

    const unsubscribe = subscribeLocation((coords) => {
      if (!mounted) return;
      setInternalLocation(coords);
      setGpsState('ready');
      setInlineError('');
    });

    const ensurePermission = async () => {
      if (Platform.OS !== 'android') return true;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const locate = async () => {
      const granted = await ensurePermission();
      if (!mounted) return;

      if (!granted) {
        setGpsState('denied');
        return;
      }

      if (watchId.current === null) {
        watchId.current = Geolocation.watchPosition(applyPosition, handleError, {
          enableHighAccuracy: true,
          distanceFilter: 10,
        });
      }

      Geolocation.getCurrentPosition(applyPosition, handleError, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000,
      });

      attempts += 1;
      if (!getLastLocation() && attempts < 6) {
        retryTimer = setTimeout(locate, 5000);
      }
    };

    locate();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribe();
      if (watchId.current !== null) Geolocation.clearWatch(watchId.current);
    };
  }, []);

  useEffect(() => {
    if (currentLocation && !internalLocation) {
      setInternalLocation(currentLocation);
      setGpsState('ready');
    }
  }, [currentLocation, internalLocation]);

  const handleAction = useCallback(async (actionType) => {
    const location = internalLocation || currentLocation;

    if (!trip?.tripId || !location) {
      setInlineError(
        gpsState === 'denied'
          ? 'Location permission is required to update the trip. Enable it in Settings.'
          : 'Waiting for a GPS lock. Move to an open area and try again.'
      );
      return false;
    }

    setInlineError('');
    Vibration.vibrate(50); // Haptic feedback for industrial feel
    setIsActionLoading(true);
    try {
      const payload = {
        tripId: trip.tripId,
        location: { lat: location.lat, lng: location.lng },
      };

      let response;
      if (actionType === "mark_arrival") response = await markedPickupArrival(payload);
      if (actionType === "mark_picked") response = await markedPickupedUp(payload);
      if (actionType === "mark_delivered") response = await markedDelivered(payload);

      if (response?.data?.success) {
        const nextStatus =
          actionType === "mark_arrival"
            ? "arrived_at_pickup"
            : actionType === "mark_picked"
              ? "picked_up"
              : "delivered";

        if (actionType === "mark_delivered") onStopLocationTracking?.();
        onTripStatusUpdate?.(nextStatus);
        return true;
      }

      Alert.alert("PROTOCOL ERROR", response?.message || "Check system link.");
      return false;
    } catch (error) {
      Alert.alert("NETWORK FAILURE", "The telemetry uplink is offline.");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [trip, internalLocation, currentLocation, gpsState, onTripStatusUpdate, onStopLocationTracking]);

  const renderContent = () => {
    const pLoc = trip?.pickupLocation;
    const dLoc = trip?.dropoffLocation;

    const distToPickup = internalLocation && pLoc?.lat
      ? haversineDistance(internalLocation.lat, internalLocation.lng, pLoc.lat, pLoc.lng)
      : Infinity;

    const distToDropoff = internalLocation && dLoc?.lat
      ? haversineDistance(internalLocation.lat, internalLocation.lng, dLoc.lat, dLoc.lng)
      : Infinity;

    switch (trip?.status) {
      case "assigned":
        return distToPickup <= PROXIMITY_THRESHOLD_METERS ? (
          <View>
            <Text style={styles.proximityHint}>WITHIN 100 M OF PICKUP</Text>
            <SlideToAccept
              key="confirm-arrival"
              label="SLIDE TO CONFIRM ARRIVAL"
              icon="map-marker-check"
              accentColor={COLORS.accent}
              loading={isActionLoading}
              disabled={gpsState !== 'ready'}
              onComplete={() => handleAction("mark_arrival")}
            />
          </View>
        ) : (
          <View style={styles.statusBox}>
            <Icon name="truck-fast" size={24} color={COLORS.muted} />
            <Text style={styles.statusMsg}>EN ROUTE TO PICKUP</Text>
            <Text style={styles.distanceLabel}>
              {formatDistance(distToPickup)
                ? `${formatDistance(distToPickup)} AWAY FROM PICKUP`
                : 'ACQUIRING GPS LOCK…'}
            </Text>
            <Text style={styles.thresholdHint}>
              ARRIVAL BUTTON UNLOCKS WITHIN 100 M
            </Text>
          </View>
        );

      case "arrived_at_pickup":
        return (
          <SlideToAccept
            key="start-loading"
            label="SLIDE TO START LOADING"
            icon="package-variant-closed"
            accentColor={COLORS.warning}
            loading={isActionLoading}
            disabled={gpsState !== 'ready'}
            onComplete={() => handleAction("mark_picked")}
          />
        );

      case "picked_up":
        return distToDropoff <= PROXIMITY_THRESHOLD_METERS ? (
          <View>
            <Text style={styles.proximityHint}>WITHIN 100 M OF DROP-OFF</Text>
            <SlideToAccept
              key="finalize-delivery"
              label="SLIDE TO FINALIZE DELIVERY"
              icon="check-decagram"
              accentColor={COLORS.accent}
              loading={isActionLoading}
              disabled={gpsState !== 'ready'}
              onComplete={() => handleAction("mark_delivered")}
            />
          </View>
        ) : (
          <View style={styles.statusBox}>
            <Icon name="navigation-variant" size={24} color={COLORS.accent} />
            <Text style={styles.statusMsg}>EN ROUTE TO DROP-OFF</Text>
            <Text style={styles.distanceLabel}>
              {formatDistance(distToDropoff)
                ? `${formatDistance(distToDropoff)} AWAY FROM DROP-OFF`
                : 'ACQUIRING GPS LOCK…'}
            </Text>
            <Text style={styles.thresholdHint}>
              DELIVERY BUTTON UNLOCKS WITHIN 100 M
            </Text>
          </View>
        );

      case "delivered":
        return (
          <View style={styles.completedBadge}>
            <Icon name="archive-check" size={20} color={COLORS.accent} />
            <Text style={styles.doneMsg}>MANIFEST CLOSED</Text>
          </View>
        );

      default:
        return <Text style={styles.statusMsg}>SYNCING WITH REGISTRY...</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {gpsState !== 'ready' && (
        <View style={styles.gpsBar}>
          {gpsState === 'denied' ? (
            <Icon name="map-marker-off-outline" size={16} color={COLORS.warning} />
          ) : (
            <ActivityIndicator size="small" color={COLORS.muted} />
          )}
          <Text style={styles.gpsText}>
            {gpsState === 'denied'
              ? 'LOCATION PERMISSION REQUIRED'
              : 'ACQUIRING GPS LOCK…'}
          </Text>
          {gpsState === 'denied' && (
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text style={styles.gpsAction}>OPEN SETTINGS</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!!inlineError && <Text style={styles.inlineError}>{inlineError}</Text>}

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 10 },
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fdf6e4',
    borderWidth: 1,
    borderColor: '#faedcc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  gpsText: {
    flex: 1,
    fontSize: 8,
    fontWeight: '900',
    color: '#8a6420',
    letterSpacing: 0.8,
  },
  gpsAction: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.dark,
    letterSpacing: 0.8,
  },
  inlineError: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 8,
    lineHeight: 15,
  },
  statusBox: { 
    alignItems: 'center', 
    backgroundColor: COLORS.bg, 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d8bf'
  },
  statusMsg: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.dark,
    fontWeight: '900',
    marginTop: 8,
  },
  distanceLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
    marginTop: 4,
  },
  thresholdHint: {
    fontSize: 8,
    color: COLORS.muted,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 6,
    textAlign: 'center',
  },
  proximityHint: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.accent + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  doneMsg: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default TripActionPanel;