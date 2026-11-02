import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProfile, patchProfile } from '../api/profile';
import { getTrips } from '../api/trips';
import socket from '../utils/socket';
import { getFcmToken } from '../utils/firebase';
import { Header } from '../components/home/header';
import { DashboardStats } from '../components/home/DashboardStats';
import { ActiveAssignment } from '../components/home/ActiveAssignment';
import { QuickActions } from '../components/home/quickActions';
import { BottomNav } from '../components/layout/BottomNav';
import IncomingRideRequestCard from '../components/rides/IncomingRequest';
import ToastAlert from '../components/ToastAlert';

const COLORS = {
  bg: '#FFFFFF',
  surface: '#fdfbf7',
  border: '#f5ebe0',
  textPrimary: '#2d241e',
  textMuted: '#7d6b5d',
  accent: '#0c831f',
  dark: '#2d241e',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const isActiveStatus = (status) => status && !['delivered', 'cancelled'].includes(status);

const sameDay = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const formatTripDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'RECENT';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${MONTHS[date.getMonth()]} • ${hours}:${minutes}`;
};

const SectionHeader = ({ title, badge, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {badge != null && (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{badge}</Text>
      </View>
    )}
    <View style={styles.headerSpacer} />
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const RecentRow = ({ trip, last }) => (
  <View style={[styles.recentRow, !last && styles.recentRowBorder]}>
    <View style={styles.recentIcon}>
      <Icon name="check-bold" size={13} color={COLORS.accent} />
    </View>
    <View style={styles.recentText}>
      <Text style={styles.recentTitle} numberOfLines={1}>
        {trip.dropoffLocation?.address || 'Completed trip'}
      </Text>
      <Text style={styles.recentMeta}>{formatTripDate(trip.requestTime)}</Text>
    </View>
    <Text style={styles.recentFare}>₹{Number(trip.fareAmount || 0).toFixed(0)}</Text>
  </View>
);

export const RiderCaptainHomeScreen = () => {
  const navigation = useNavigation();
  const [rideRequests, setRideRequests] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [trips, setTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });
  const alertTimer = useRef(null);

  useEffect(() => () => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
  }, []);

  const showAlert = (type, message, duration = 3500) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ visible: true, type, message });
    alertTimer.current = setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const profileRes = await getProfile();
      const user = profileRes?.data?.user;
      setUserProfile(user);
      setIsOnline(Boolean(user?.isOnline));

      if (!user?.id) return;

      const tripsRes = await getTrips('');
      const allTrips = tripsRes?.data?.data || [];
      setTrips(allTrips.filter((trip) => trip.deliveryAgent === user.id));
    } catch (err) {
      console.log('Dashboard sync failed:', err?.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getFcmToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  useEffect(() => {
    const onRideRequest = (orderData) => {
      setRideRequests(orderData);
      Vibration.vibrate([0, 500, 200, 500]);
    };

    socket.on('rider:rideRequest', onRideRequest);
    return () => socket.off('rider:rideRequest', onRideRequest);
  }, []);

  const handleToggleOnline = async () => {
    if (!userProfile?.id) {
      showAlert('error', 'Profile is still loading. Please try again.');
      return;
    }
    if (togglingOnline) return;

    const previous = isOnline;
    const next = !previous;

    setIsOnline(next);
    setTogglingOnline(true);

    try {
      await patchProfile(userProfile.id, { isOnline: next });
      setUserProfile((prev) => ({ ...prev, isOnline: next }));

      if (socket?.emit) {
        socket.emit('rider:status', { riderId: userProfile.id, isOnline: next });
      }

      showAlert(
        'success',
        next ? 'You are online. Ride requests are now enabled.' : 'You are offline. Ride requests are paused.'
      );
    } catch (err) {
      setIsOnline(previous);
      showAlert(
        'error',
        err?.response?.data?.message || 'Could not change your duty status. Please try again.'
      );
    } finally {
      setTogglingOnline(false);
    }
  };

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.requestTime || 0) - new Date(a.requestTime || 0)
  );
  const activeTrips = sortedTrips.filter((trip) => isActiveStatus(trip.status));
  const completedTrips = sortedTrips.filter((trip) => trip.status === 'delivered');
  const todayTrips = sortedTrips.filter((trip) => sameDay(trip.requestTime));
  const earnings = todayTrips
    .filter((trip) => trip.status === 'delivered')
    .reduce(
      (sum, trip) =>
        sum + Number(trip.fareBreakup?.deliveryPartnerShare || trip.fareAmount || 0),
      0
    );
  const activeTrip = activeTrips[0] || null;
  const recentTrips = completedTrips.slice(0, 3);

  const openActiveTrip = () => {
    const pickup = activeTrip?.pickupLocation;
    const dropoff = activeTrip?.dropoffLocation;

    if (pickup?.lat != null && dropoff?.lat != null) {
      navigation.navigate('MapScreen', {
        pickupGeo: { lat: pickup.lat, lng: pickup.lng },
        dropoffGeo: { lat: dropoff.lat, lng: dropoff.lng },
        trip: activeTrip,
      });
    } else {
      navigation.navigate('Trips');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={COLORS.dark}
            colors={[COLORS.dark]}
          />
        }
      >
        <View style={styles.headerWrap}>
          <Header
            profile={userProfile}
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            toggling={togglingOnline}
          />
        </View>

        <View style={styles.body}>
          <DashboardStats
            earnings={earnings}
            tripsToday={todayTrips.length}
            activeTrips={activeTrips.length}
          />

          {rideRequests.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="INCOMING REQUESTS" badge={rideRequests.length} />
              {rideRequests.map((trip, index) => (
                <IncomingRideRequestCard key={trip?.tripId || index} trip={trip} />
              ))}
            </View>
          )}

          {activeTrip && (
            <View style={styles.section}>
              <SectionHeader title="ACTIVE ASSIGNMENT" />
              <ActiveAssignment trip={activeTrip} onOpen={openActiveTrip} />
            </View>
          )}

          <View style={styles.section}>
            <SectionHeader title="QUICK ACTIONS" />
            <QuickActions />
          </View>

          {recentTrips.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="RECENT ACTIVITY"
                action="VIEW ALL"
                onAction={() => navigation.navigate('Trips')}
              />
              <View style={styles.recentCard}>
                {recentTrips.map((trip, index) => (
                  <RecentRow
                    key={trip.tripId || index}
                    trip={trip}
                    last={index === recentTrips.length - 1}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav active="Home" />

      <ToastAlert visible={alert.visible} type={alert.type} message={alert.message} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.4,
  },
  headerSpacer: {
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
  },
  countText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionAction: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 0.8,
  },
  recentCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  recentIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#eaf6ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentText: {
    flex: 1,
    gap: 2,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recentMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  recentFare: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
});
