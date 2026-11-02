import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  dark: '#2d241e',
  surface: '#3a2f27',
  muted: 'rgba(255,255,255,0.58)',
  accent: '#8fd694',
  accentSoft: 'rgba(12, 131, 31, 0.22)',
  divider: 'rgba(255,255,255,0.12)',
};

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const Stat = ({ icon, value, label }) => (
  <View style={styles.stat}>
    <View style={styles.statIcon}>
      <Icon name={icon} size={15} color={COLORS.accent} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

export const DashboardStats = ({ earnings = 0, tripsToday = 0, activeTrips = 0 }) => (
  <View style={styles.card}>
    <View style={styles.glowOne} />
    <View style={styles.glowTwo} />

    <View style={styles.topRow}>
      <Text style={styles.label}>TODAY'S EARNINGS</Text>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>

    <Text style={styles.amount}>
      <Text style={styles.currency}>₹</Text>
      {formatMoney(earnings)}
    </Text>

    <View style={styles.divider} />

    <View style={styles.statsRow}>
      <Stat icon="truck-check-outline" value={tripsToday} label="TRIPS TODAY" />
      <View style={styles.verticalDivider} />
      <Stat icon="navigation-variant-outline" value={activeTrips} label="ACTIVE NOW" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  glowOne: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(12, 131, 31, 0.16)',
  },
  glowTwo: {
    position: 'absolute',
    bottom: -80,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1.6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 8,
  },
  currency: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e6dccf',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(143, 214, 148, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },
});
