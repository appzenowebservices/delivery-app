import React, { memo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Animated,
  Easing,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LeafletMapComponent from '../../components/LeafletMap';
import { useNavigation } from '@react-navigation/native';
import { acceptRide } from '../../api/trips';

// Industrial Palette System
const COLORS = {
  dark: '#2d241e',      // Slate 900
  muted: '#7d6b5d',     // Slate 500
  accent: '#0c831f',    // Emerald (Success)
  danger: '#d32f2f',    // Red (Urgent)
  bg: '#FFFFFF',
  surface: '#fdfbf7',   // Gray 50
  border: '#f5ebe0',    // Gray 100
};

const IncomingRideRequestCard = ({
  trip,
  requestId,
  onTimeout,
  onAccepted,
  timeoutSeconds = 6000000000,
}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds / 1000);
  const countdownAnimation = useRef(new Animated.Value(1)).current;
  const timeoutHandledRef = useRef(false);

  const [routeInfo, setRouteInfo] = useState({
    distance: trip?.estimatedDistance || '...',
    duration: trip?.estimatedTime || '...',
  });

  useEffect(() => {
    // High-attention vibration pattern
    Vibration.vibrate([0, 500, 1000, 500], true);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          Vibration.cancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      Vibration.cancel();
    };
  }, [requestId]);

  useEffect(() => {
    timeoutHandledRef.current = false;
  }, [requestId, trip?.id]);

  useEffect(() => {
    if (timeLeft === 0 && !timeoutHandledRef.current) {
      timeoutHandledRef.current = true;
      onTimeout?.(requestId);
    }
  }, [timeLeft, onTimeout, requestId]);

  useEffect(() => {
    Animated.timing(countdownAnimation, {
      toValue: timeLeft / (timeoutSeconds / 1000),
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const handleAccept = async () => {
    if (loading !== '' || timeLeft === 0) return;
    setLoading("accept");
    try {
      Vibration.cancel();
      console.log('resp====cjala',trip);
      const resp = await acceptRide(trip);
      console.log('resp====',resp);
      
      const acceptedTrip = resp?.data?.data || resp?.data || trip;
      onAccepted?.(acceptedTrip);

      navigation.navigate("MapScreen", {
        trip: acceptedTrip,
        pickupGeo: acceptedTrip?.pickupLocation,
        dropoffGeo: acceptedTrip?.dropoffLocation,
      });
    } catch (error) {
      Alert.alert("SYSTEM ERROR", "Connection to dispatch failed. Please retry.");
    } finally {
      setLoading("");
    }
  };

  const countdownBarWidth = countdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.manifestCard}>
      {/* ALERT HEADER */}
      <View style={styles.alertHeader}>
        <View style={styles.statusGroup}>
          <View style={styles.pulseDot} />
          <Text style={styles.alertTitle}>INCOMING ASSIGNMENT</Text>
        </View>
        <Text style={styles.timerCount}>{timeLeft}s</Text>
      </View>

      {/* TELEMETRY GAUGE (Countdown) */}
      <View style={styles.gaugeContainer}>
        <Animated.View
          style={[
            styles.gaugeFill,
            {
              width: countdownBarWidth,
              backgroundColor: timeLeft < 15 ? COLORS.danger : COLORS.accent
            }
          ]}
        />
      </View>

      <View style={styles.mainContent}>
        {/* ENTITY INFO */}
        <View style={styles.requesterRow}>
          <Icon name="account-circle" size={24} color={COLORS.dark} />
          <Text style={styles.customerName}>{trip?.customer?.name?.toUpperCase()}</Text>
        </View>

        {/* LOGISTICS BLOCK */}
        <View style={styles.routeContainer}>
          <View style={styles.routeStep}>
            <Icon name="record-circle-outline" size={16} color={COLORS.accent} />
            <Text style={styles.routeText} numberOfLines={1}>{trip?.pickupLocation?.address}</Text>
          </View>
          <View style={styles.connector} />
          <View style={styles.routeStep}>
            <Icon name="map-marker" size={16} color={COLORS.danger} />
            <Text style={styles.routeText} numberOfLines={1}>{trip?.dropoffLocation?.address}</Text>
          </View>
        </View>

        {/* MAP PREVIEW */}
        <View style={styles.mapFrame}>
          <LeafletMapComponent
            pickupGeo={{ latitude: trip?.pickupLocation?.lat, longitude: trip?.pickupLocation?.lng }}
            dropoffGeo={{ latitude: trip?.dropoffLocation?.lat, longitude: trip?.dropoffLocation?.lng }}
            onRouteFound={(dist, dur) => setRouteInfo({ distance: `${dist} km`, duration: `${dur} min` })}
          />
        </View>

        {/* DATA GRID */}
        <View style={styles.dataGrid}>
          <View style={styles.dataPoint}>
            <Text style={styles.dataLabel}>EST. TIME</Text>
            <Text style={styles.dataValue}>{routeInfo.duration}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.dataPoint}>
            <Text style={styles.dataLabel}>NET PAYOUT</Text>
            <Text style={[styles.dataValue, { color: COLORS.dark }]}>
              {trip?.currency} {trip?.fareBreakup?.totalPayable}
            </Text>
          </View>
        </View>

        {/* COMMAND ACTION */}
        <TouchableOpacity
          style={[styles.acceptBtn, timeLeft === 0 && styles.disabledBtn]}
          onPress={handleAccept}
          disabled={loading !== '' || timeLeft === 0}
          activeOpacity={0.9}
        >
          {loading === 'accept' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.acceptBtnText}>ACCEPT MANIFEST</Text>
              <Icon name="chevron-right" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* EXPIRED OVERLAY */}
      {timeLeft === 0 && (
        <View style={styles.expiredOverlay}>
          <View style={styles.stampBox}>
            <Text style={styles.stampText}>EXPIRED</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  manifestCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    // Modern Drop Shadow
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timerCount: {
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    fontSize: 16,
  },
  gaugeContainer: {
    height: 4,
    backgroundColor: '#2d241e',
  },
  gaugeFill: {
    height: '100%',
  },
  mainContent: {
    padding: 20,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.dark,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connector: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
    marginLeft: 7.5,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
    flex: 1,
  },
  mapFrame: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  dataGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dataPoint: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  dataLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.dark,
  },
  acceptBtn: {
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabledBtn: {
    backgroundColor: COLORS.muted,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 15,
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampBox: {
    borderWidth: 4,
    borderColor: COLORS.danger,
    padding: 10,
    transform: [{ rotate: '-15deg' }],
  },
  stampText: {
    color: COLORS.danger,
    fontSize: 32,
    fontWeight: '900',
  }
});

export default memo(IncomingRideRequestCard);