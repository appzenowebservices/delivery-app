import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfile } from '../api/profile';
import IncomingRideRequestCard from '../components/rides/IncomingRequest';
import socket from '../utils/socket';
import { getFcmToken } from '../utils/firebase';
import { Header } from '../components/home/header';
import { CurrentPerformance } from '../components/home/performance';
import { InsightsAndTips } from '../components/home/InsightsAndTips';
import MonsoonBanner from '../components/banners/MonsoonBanner';
import { QuickActions } from '../components/home/quickActions';

// Industrial Palette
const COLORS = {
  bg: '#FFFFFF',
  surface: '#fdfbf7', // Gray 50
  border: '#f5ebe0', // Gray 100
  textPrimary: '#2d241e', // Slate 900
  textMuted: '#a68b66', // Slate 400
  accent: '#0c831f', // Emerald 500 (Operational Green)
  dark: '#ae2012', // Gray 900
};

const NAV_ITEMS = [
  { name: 'Earnings', icon: 'chart-box-outline', route: 'Earnings' },
  { name: 'Trips', icon: 'truck-delivery', route: 'Trips' },
  { name: 'Profile', icon: 'account-circle-outline', route: 'Profile' },
];

export const RiderCaptainHomeScreen = () => {
  const navigation = useNavigation();
  const [rideRequests, setRideRequests] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    getFcmToken();
    getProfile()
      .then(res => {
        setUserProfile(res?.data?.user);
        setIsOnline(res?.data?.user?.isActive);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    socket.on('rider:rideRequest', (orderData) => {
      setRideRequests(orderData);
      Vibration.vibrate([0, 500, 200, 500]);
    });
    return () => socket.off('rider:rideRequest');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Modern Tactical Header */}
      <View style={styles.headerContainer}>
        <Header profile={userProfile} onlineStatus={isOnline} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Live Manifest Feed */}
        {rideRequests.length > 0 && (
          <View style={styles.requestSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionLabel}>Incoming Manifests</Text>
              <Text style={styles.countBadge}>{rideRequests.length}</Text>
            </View>
            {rideRequests.map((trip, index) => (
              <IncomingRideRequestCard key={index} trip={trip} />
            ))}
          </View>
        )}

        {/* Performance Metrics Section */}
        <View style={styles.sectionWrapper}>
            <CurrentPerformance />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsWrapper}>
          <Text style={styles.sectionLabel}>Operations</Text>
          <QuickActions />
        </View>

        <MonsoonBanner />
        <InsightsAndTips />
      </ScrollView>

      {/* Industrial Bottom Navigation */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const isActive = item.route === 'Trips';
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <Icon
                name={item.icon}
                size={24}
                color={isActive ? COLORS.dark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.name}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerContainer: {
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: COLORS.dark,
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requestSection: {
    marginBottom: 24,
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  actionsWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeNavLabel: {
    color: COLORS.dark,
  },
  activeIndicator: {
    marginTop: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.dark,
  },
});