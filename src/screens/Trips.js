import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Changed to Community for consistency
import { baseURL } from '../config';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import local components
import IncomingRideRequestCard from '../components/rides/IncomingRequest';
import TripCard from '../components/rides/TripCard';
import { EmptyState } from '../components/rides/EmptyState';
import { FilterPanel } from '../components/rides/FilterPanel';
import { getProfile } from '../api/profile';

// Industrial Palette System
const COLORS = {
  dark: '#0F172A',      // Slate 900
  muted: '#64748B',     // Slate 500
  bg: '#FFFFFF',
  surface: '#F8FAFC',   // Gray 50
  border: '#F1F5F9',    // Gray 100
  accent: '#10B981',    // Operational Green
  warning: '#F59E0B',   // Warning Amber
};

const TripsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  
  const [showIncomingRide, setShowIncomingRide] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [activeTab, setActiveTab] = useState('current');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dpAcceptedTrip, setDpAcceptedTrip] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);

  const fetchIncomingTripByOrderId = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(
        `${baseURL}/api/v1/delivery-partner/trip/order/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncomingRide(res.data.data);
      setShowIncomingRide(true);
    } catch (err) {
      console.error("Error fetching incoming trip:", err);
    }
  };

  const fetchTripDetail = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const profileRes = await getProfile();
      const userId = profileRes?.data?.user?.id;
      if (!userId) throw new Error("User not found");

      const res = await axios.get(`${baseURL}/api/v1/delivery-partner/trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const trips = res?.data?.data || [];
      
      const userTrips = trips.filter(trip => trip.deliveryAgent === userId);
      setDpAcceptedTrip(userTrips.filter(trip => trip.status !== "delivered"));
      setTripHistory(userTrips.filter(trip => trip.status === "delivered"));
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (orderId) fetchIncomingTripByOrderId(orderId); }, [orderId]);
  
  useFocusEffect(
    React.useCallback(() => {
      fetchTripDetail().catch(err => console.error(err));
    }, [])
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <SafeAreaView style={styles.container}>
        {/* OPERATIONAL HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MANIFEST SYSTEM</Text>
            <Text style={styles.headerTitle}>Trip Registry</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerIconButton} 
              onPress={() => setFilterOpen(!filterOpen)}
            >
              <Icon name="tune-variant" size={22} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* INDUSTRIAL TABS */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "current" && styles.activeTab]}
            onPress={() => setActiveTab("current")}
          >
            <Text style={[styles.tabText, activeTab === "current" && styles.activeTabText]}>ACTIVE</Text>
            <View style={[styles.badge, activeTab === "current" ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.badgeText}>{dpAcceptedTrip.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>ARCHIVE</Text>
            <View style={[styles.badge, activeTab === "history" ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.badgeText}>{tripHistory.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FilterPanel filterOpen={filterOpen} setFilterOpen={setFilterOpen} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "current" && showIncomingRide && incomingRide && (
            <IncomingRideRequestCard
              trip={incomingRide}
              onAccepted={() => {
                setIncomingRide(null);
                setShowIncomingRide(false);
                fetchTripDetail();
              }}
              onTimeout={() => {
                setIncomingRide(null);
                setShowIncomingRide(false);
              }}
            />
          )}

          <View style={styles.sectionHeader}>
            <Icon name="format-list-bulleted-type" size={14} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>
              {activeTab === "current" ? 'CURRENT ASSIGNMENTS' : 'HISTORICAL DATA'}
            </Text>
          </View>

          {activeTab === "current" ? (
            <View>
              {dpAcceptedTrip?.length > 0 ? (
                dpAcceptedTrip.map(trip => <TripCard key={trip.id} trip={trip} />)
              ) : (
                <EmptyState />
              )}
            </View>
          ) : (
            <View>
              {tripHistory?.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* TACTILE BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <NavButton label="EARNINGS" icon="chart-box-outline" onPress={() => navigation.navigate('Earnings')} />
          <NavButton label="LOGS" icon="truck-delivery" active />
          <NavButton label="PROFILE" icon="account-circle-outline" onPress={() => navigation.navigate('Profile')} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const NavButton = ({ label, icon, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.navItem}>
    <Icon name={icon} size={24} color={active ? COLORS.dark : COLORS.muted} />
    <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerSub: { 
    fontSize: 10, 
    color: COLORS.muted, 
    fontWeight: '900', 
    letterSpacing: 2 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: COLORS.dark, 
    letterSpacing: -0.5 
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 6,
    gap: 8,
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  activeTab: { 
    backgroundColor: COLORS.bg,
    // Soft Shadow for active tab
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 11, fontWeight: '900', color: COLORS.muted, letterSpacing: 0.5 },
  activeTabText: { color: COLORS.dark },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadge: { backgroundColor: COLORS.dark },
  inactiveBadge: { backgroundColor: COLORS.border },
  badgeText: { fontSize: 10, fontWeight: '900', color: COLORS.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: COLORS.muted, 
    letterSpacing: 1 
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-around',
  },
  navItem: { alignItems: 'center', gap: 4 },
  navLabel: { 
    fontSize: 9, 
    color: COLORS.muted, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  activeNavLabel: { color: COLORS.dark },
});

export default TripsScreen;