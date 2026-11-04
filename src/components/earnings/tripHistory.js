// components/earnings/tripHistory.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { getTrips } from '../../api/trips';
import { getProfile } from '../../api/profile';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f',
  bg: '#fdfbf7',
  surface: '#FFFFFF',
  border: '#e9d8bf',
};

const inPeriod = (value, period) => {
  if (!value) return period === 'custom';
  const date = moment(value);
  const now = moment();

  if (period === 'today') return date.isSame(now, 'day');
  if (period === 'week') return date.isAfter(now.clone().subtract(7, 'days'));
  if (period === 'custom') return date.isAfter(now.clone().subtract(30, 'days'));

  return date.isSame(now, 'month'); // month
};

const TripHistory = ({ selectedPeriod = 'today' }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [profileRes, tripsRes] = await Promise.all([
          getProfile(),
          getTrips(''),
        ]);

        const userId = profileRes?.data?.user?.id;
        const all = tripsRes?.data?.data || [];

        const delivered = all.filter(
          (trip) =>
            trip.status === 'delivered' &&
            (!userId || !trip.deliveryAgent || trip.deliveryAgent === userId)
        );

        if (mounted) setTrips(delivered);
      } catch (error) {
        if (mounted) setTrips([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleTrips = trips
    .filter((trip) => inPeriod(trip.requestTime, selectedPeriod))
    .sort((a, b) => new Date(b.requestTime || 0) - new Date(a.requestTime || 0));

  const renderTripItem = ({ item }) => {
    const pickupAddress = item.pickupLocation?.address || 'Pickup point';
    const dropAddress = item.dropoffLocation?.address || 'Drop-off point';
    const date = moment(item.requestTime).format('DD MMM, YYYY');
    const time = moment(item.requestTime).format('HH:mm');
    const amount = Number(
      item.fareBreakup?.deliveryPartnerShare ?? item.fareAmount ?? 0
    );
    const status = item.status || 'unknown';
    const ref = item.orderId || item.tripId;

    return (
      <View style={styles.logCard}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.orderLabel}>TRIP_ID</Text>
            <Text style={styles.orderId}>
              #{ref ? ref.toString().slice(-8).toUpperCase() : 'N/A'}
            </Text>
          </View>
          <View style={styles.timeGroup}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        <View style={styles.routeWrapper}>
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: COLORS.dark }]} />
          </View>

          <View style={styles.addressContainer}>
            <Text numberOfLines={1} style={styles.addressLine}>{pickupAddress}</Text>
            <View style={styles.routeSpacer} />
            <Text numberOfLines={1} style={styles.addressLine}>{dropAddress}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.amountValue}>{amount.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, styles.bgSuccess]}>
            <Icon name="check-circle" size={12} color={COLORS.accent} />
            <Text style={[styles.statusText, { color: COLORS.accent }]}>
              {status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailsButton}>
            <Text style={styles.detailsText}>VIEW MANIFEST</Text>
            <Icon name="chevron-right" size={14} color={COLORS.muted} />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={COLORS.dark} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={visibleTrips}
      renderItem={renderTripItem}
      keyExtractor={(item) => item.tripId || item.orderId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Icon name="clipboard-text-off-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>NO TRIPS IN THIS PERIOD</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  logCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
    paddingBottom: 12,
  },
  idGroup: { flex: 1 },
  orderLabel: { fontSize: 8, fontWeight: '900', color: COLORS.muted, letterSpacing: 1 },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timeGroup: { alignItems: 'flex-end' },
  dateText: { fontSize: 11, fontWeight: '700', color: COLORS.dark },
  timeText: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },

  routeWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeline: { width: 12, alignItems: 'center', marginRight: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  line: { width: 1, height: 20, backgroundColor: COLORS.border, marginVertical: 2 },

  addressContainer: { flex: 1 },
  addressLine: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  routeSpacer: { height: 12 },

  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginLeft: 12 },
  currency: { fontSize: 10, fontWeight: '900', color: COLORS.dark, marginRight: 2 },
  amountValue: { fontSize: 20, fontWeight: '900', color: COLORS.dark },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 0,
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  bgSuccess: { backgroundColor: COLORS.accent + '15' },
  statusText: { fontSize: 9, fontWeight: '900' },

  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 9, fontWeight: '800', color: COLORS.muted },
});

export default TripHistory;
