// components/earnings/tripHistory.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRideHistory } from '../../api/transactions';
import moment from 'moment';

const COLORS = {
  dark: '#0F172A',      // Slate 900
  muted: '#64748B',     // Slate 500
  accent: '#10B981',    // Emerald 500
  bg: '#F8FAFC',        // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

const TripHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await getRideHistory();
      setTransactions(res?.data?.transactions || []);
    } catch (err) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const renderTripItem = ({ item }) => {
    const trip = item.trip;
    const vendor = item.vendor;

    const pickupAddress = vendor?.addressStreet || 'Primary Warehouse';
    const dropAddress = item.customerAddress?.locationAddress || 'Client Destination';
    const date = moment(item.createdAt).format('DD MMM, YYYY');
    const time = moment(item.createdAt).format('HH:mm');
    const status = trip?.status || 'unknown';

    return (
      <View style={styles.logCard}>
        {/* Card Header: IDs and Time */}
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.orderLabel}>REG_ID</Text>
            <Text style={styles.orderId}>#{item.order?.orderId?.slice(-8).toUpperCase() || 'N/A'}</Text>
          </View>
          <View style={styles.timeGroup}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        {/* Route Visualization */}
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
            <Text style={styles.amountValue}>{item.amount.toFixed(0)}</Text>
          </View>
        </View>

        {/* Card Footer: Status and Meta */}
        <View style={styles.cardFooter}>
          <View style={[
            styles.statusBadge, 
            status === 'delivered' ? styles.bgSuccess : styles.bgWarning
          ]}>
            <Icon 
              name={status === 'delivered' ? "check-circle" : "clock-outline"} 
              size={12} 
              color={status === 'delivered' ? COLORS.accent : COLORS.dark} 
            />
            <Text style={[
              styles.statusText,
              { color: status === 'delivered' ? COLORS.accent : COLORS.dark }
            ]}>
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
      data={transactions}
      renderItem={renderTripItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyState}>
           <Icon name="clipboard-text-off-outline" size={48} color={COLORS.border} />
           <Text style={styles.emptyText}>NO ARCHIVED TRANSACTIONS</Text>
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
    letterSpacing: 1.5 
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
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
  bgWarning: { backgroundColor: '#FDE68A' }, // Light Amber
  statusText: { fontSize: 9, fontWeight: '900' },
  
  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 9, fontWeight: '800', color: COLORS.muted },
});

export default TripHistory;