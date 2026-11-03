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
} from "react-native";
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  markedDelivered,
  markedPickupArrival,
  markedPickupedUp,
} from "../../api/trips";
import SlideToAccept from "./SlideToAccept";

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f', // Emerald
  warning: '#e9c46a', // Amber
  bg: '#fdfbf7',
};

// 500 meters for "Arrived" state
const PROXIMITY_THRESHOLD_METERS = 500000;

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
  const [internalLocation, setInternalLocation] = useState(currentLocation || null);
  const [gpsState, setGpsState] = useState(currentLocation ? 'ready' : 'locating');
  const [inlineError, setInlineError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    const handlePosition = (pos) => {
      setInternalLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGpsState('ready');
      setInlineError('');
    };

    const handleError = (err) => {
      console.log('Location Error:', err);
      setGpsState((prev) => (prev === 'ready' ? prev : err?.code === 1 ? 'denied' : 'weak'));
    };

    Geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
    });

    watchId.current = Geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      distanceFilter: 10,
    });

    return () => watchId.current !== null && Geolocation.clearWatch(watchId.current);
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
          <SlideToAccept
            key="confirm-arrival"
            label="SLIDE TO CONFIRM ARRIVAL"
            icon="map-marker-check"
            accentColor={COLORS.accent}
            loading={isActionLoading}
            disabled={gpsState !== 'ready'}
            onComplete={() => handleAction("mark_arrival")}
          />
        ) : (
          <View style={styles.statusBox}>
            <Icon name="truck-fast" size={24} color={COLORS.muted} />
            <Text style={styles.statusMsg}>EN ROUTE TO ORIGIN</Text>
            <Text style={styles.distanceLabel}>
               {distToPickup > 1000 ? `${(distToPickup / 1000).toFixed(1)} KM` : `${Math.round(distToPickup)} M`} REMAINING
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
          <SlideToAccept
            key="finalize-delivery"
            label="SLIDE TO FINALIZE DELIVERY"
            icon="check-decagram"
            accentColor={COLORS.accent}
            loading={isActionLoading}
            disabled={gpsState !== 'ready'}
            onComplete={() => handleAction("mark_delivered")}
          />
        ) : (
          <View style={styles.statusBox}>
            <Icon name="navigation-variant" size={24} color={COLORS.accent} />
            <Text style={styles.statusMsg}>CARGO IN TRANSIT</Text>
            <Text style={styles.distanceLabel}>
              {distToDropoff > 1000 ? `${(distToDropoff / 1000).toFixed(1)} KM` : `${Math.round(distToDropoff)} M`} TO DESTINATION
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