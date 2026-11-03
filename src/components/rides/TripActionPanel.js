// components/rides/TripActionPanel.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Vibration,
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

const TripActionPanel = ({ trip, onTripStatusUpdate, onStopLocationTracking }) => {
  const [internalLocation, setInternalLocation] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => setInternalLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.log('Location Error:', err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    watchId.current = Geolocation.watchPosition(
      (pos) => setInternalLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.log('Watch Error:', err),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => watchId.current !== null && Geolocation.clearWatch(watchId.current);
  }, []);

  const handleAction = useCallback(async (actionType) => {
    if (!trip?.tripId || !internalLocation) {
      Alert.alert("GPS ERROR", "Awaiting satellite lock for verification.");
      return false;
    }

    Vibration.vibrate(50); // Haptic feedback for industrial feel
    setIsActionLoading(true);
    try {
      const payload = {
        tripId: trip.tripId,
        location: { lat: internalLocation.lat, lng: internalLocation.lng },
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
  }, [trip, internalLocation, onTripStatusUpdate, onStopLocationTracking]);

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

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 10 },
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