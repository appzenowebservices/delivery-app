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
} from "react-native";
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  markedDelivered,
  markedPickupArrival,
  markedPickupedUp,
} from "../../api/trips";

const COLORS = {
  dark: '#0F172A',
  muted: '#64748B',
  accent: '#10B981', // Emerald
  action: '#3B82F6', // Blue
  warning: '#F59E0B', // Amber
  bg: '#F8FAFC',
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
      return;
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
        if (actionType === "mark_delivered") onStopLocationTracking?.();
        onTripStatusUpdate?.(); 
      } else {
        Alert.alert("PROTOCOL ERROR", response?.message || "Check system link.");
      }
    } catch (error) {
      Alert.alert("NETWORK FAILURE", "The telemetry uplink is offline.");
    } finally {
      setIsActionLoading(false);
    }
  }, [trip, internalLocation, onTripStatusUpdate, onStopLocationTracking]);

  const renderContent = () => {
    if (isActionLoading) return <ActivityIndicator color={COLORS.action} size="large" style={{ marginVertical: 10 }} />;

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
          <IndustrialButton
            title="CONFIRM ARRIVAL"
            icon="map-marker-check"
            color={COLORS.dark}
            onPress={() => handleAction("mark_arrival")}
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
          <IndustrialButton
            title="INITIATE LOADING"
            icon="package-variant-closed"
            color={COLORS.warning}
            onPress={() => handleAction("mark_picked")}
          />
        );

      case "picked_up":
        return distToDropoff <= PROXIMITY_THRESHOLD_METERS ? (
          <IndustrialButton
            title="FINALIZE DELIVERY"
            icon="check-decagram"
            color={COLORS.accent}
            onPress={() => handleAction("mark_delivered")}
          />
        ) : (
          <View style={styles.statusBox}>
            <Icon name="navigation-variant" size={24} color={COLORS.action} />
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

const IndustrialButton = ({ title, icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name={icon} size={20} color="#fff" style={{ marginRight: 12 }} />
    <Text style={styles.btnText}>{title}</Text>
    <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.5)" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 10 },
  statusBox: { 
    alignItems: 'center', 
    backgroundColor: COLORS.bg, 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
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
  btn: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default TripActionPanel;