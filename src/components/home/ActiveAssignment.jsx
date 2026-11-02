import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f',
  bg: '#FFFFFF',
  surface: '#fdfbf7',
  border: '#f5ebe0',
  warning: '#b07d2b',
};

const STATUS_LABEL = {
  created: 'CREATED',
  assigned: 'ASSIGNED',
  accepted: 'ACCEPTED',
  en_route_to_pickup: 'EN ROUTE',
  arrived_at_pickup: 'AT PICKUP',
  picked_up: 'PICKED UP',
  en_route_to_delivery: 'DELIVERING',
};

export const ActiveAssignment = ({ trip, onOpen }) => {
  if (!trip) return null;

  const pickup = trip.pickupLocation?.address || 'Pickup point';
  const dropoff = trip.dropoffLocation?.address || 'Drop-off point';
  const status = STATUS_LABEL[trip.status] || 'IN PROGRESS';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>ACTIVE ASSIGNMENT</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.path}>
          <View style={styles.nodeStart} />
          <View style={styles.connector} />
          <View style={styles.nodeEnd} />
        </View>

        <View style={styles.locations}>
          <View style={styles.locBlock}>
            <Text style={styles.locLabel}>PICKUP</Text>
            <Text style={styles.locText} numberOfLines={1}>{pickup}</Text>
          </View>
          <View style={styles.locBlock}>
            <Text style={styles.locLabel}>DROP-OFF</Text>
            <Text style={styles.locText} numberOfLines={1}>{dropoff}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Icon name="map-marker-distance" size={14} color={COLORS.muted} />
          <Text style={styles.metaText}>{trip.estimatedDistance || 'N/A'}</Text>
          <Icon name="clock-outline" size={14} color={COLORS.muted} style={{ marginLeft: 12 }} />
          <Text style={styles.metaText}>{trip.estimatedTime || 'N/A'}</Text>
        </View>

        <TouchableOpacity style={styles.openButton} onPress={onOpen} activeOpacity={0.85}>
          <Text style={styles.openText}>OPEN</Text>
          <Icon name="arrow-top-right" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  headerTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.dark,
    letterSpacing: 1.4,
  },
  statusBadge: {
    backgroundColor: '#fdf6e4',
    borderWidth: 1,
    borderColor: '#faedcc',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.warning,
    letterSpacing: 0.8,
  },
  route: {
    flexDirection: 'row',
    gap: 12,
  },
  path: {
    alignItems: 'center',
    paddingTop: 6,
    width: 12,
  },
  nodeStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  connector: {
    flex: 1,
    width: 1.5,
    backgroundColor: COLORS.border,
    marginVertical: 3,
    minHeight: 24,
  },
  nodeEnd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.dark,
  },
  locations: {
    flex: 1,
    gap: 12,
  },
  locBlock: {
    gap: 2,
  },
  locLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1,
  },
  locText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  openText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
