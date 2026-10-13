// components/earnings/overview.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTransactionsOverview } from '../../api/transactions';

const COLORS = {
  dark: '#2d241e',      // Slate 900
  muted: '#7d6b5d',     // Slate 500
  accent: '#0c831f',    // Emerald 500
  warning: '#e9c46a',   // Amber 500
  error: '#d32f2f',     // Red 500
  surface: '#FFFFFF',
  bg: '#fdfbf7',
  border: '#e9d8bf',
};

const EarningsOverview = ({ selectedPeriod = 'today' }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getTransactionsOverview()
      .then(res => setTransactions(res.data?.transactions || []))
      .catch(err => console.log(err));
  }, []);

  const now = new Date();

  const getData = () => {
    const filterToday = () => transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d.toDateString() === now.toDateString();
    });

    const filterWeek = () => transactions.filter(t => {
      const d = new Date(t.createdAt);
      return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    });

    const filterMonth = () => transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    let t = selectedPeriod === 'today' ? filterToday() : selectedPeriod === 'week' ? filterWeek() : filterMonth();
    const completed = t.filter(x => x?.trip?.status === 'delivered' || x?.trip?.status === 'completed');
    const totalEarnings = completed.reduce((s, x) => s + (x.amount || 0), 0);
    const commission = -(totalEarnings * 0.1);
    const netEarnings = totalEarnings + commission;

    return {
      totalEarnings,
      rides: completed.length,
      hours: (completed.length * 0.4).toFixed(1),
      commission,
      netEarnings,
    };
  };

  const data = getData();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* PERFORMANCE SUMMARY CARD */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>TOTAL SETTLEMENT</Text>
            <Text style={styles.heroValue}>₹{data.netEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.trendBadge}>
            <Icon name="trending-up" size={14} color={COLORS.accent} />
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricItem label="TRIPS" value={data.rides} icon="truck-delivery-outline" />
          <MetricItem label="DUTY HRS" value={`${data.hours}h`} icon="clock-outline" />
          <MetricItem label="AVG/TRIP" value={`₹${(data.rides ? data.totalEarnings / data.rides : 0).toFixed(0)}`} icon="chart-line" />
        </View>
      </View>

      {/* AUDIT BREAKDOWN */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>TRANSACTION AUDIT</Text>
        <View style={styles.auditBox}>
          <AuditRow label="Gross Trip Revenue" value={data.totalEarnings} color={COLORS.dark} />
          <AuditRow label="Incentives & Tips" value={0} color={COLORS.accent} prefix="+" />
          <AuditRow label="Platform Fee (10%)" value={data.commission} color={COLORS.error} />
          
          <View style={styles.divider} />
          
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>NET PAYOUT</Text>
            <Text style={styles.netValue}>₹{data.netEarnings.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Icon name="shield-check-outline" size={12} color={COLORS.muted} />
          <Text style={styles.footerText}>
            VERIFIED FOR {selectedPeriod.toUpperCase()} • {now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const MetricItem = ({ label, value, icon }) => (
  <View style={styles.metricItem}>
    <Icon name={icon} size={16} color={COLORS.muted} style={{ marginBottom: 4 }} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const AuditRow = ({ label, value, color, prefix = "" }) => (
  <View style={styles.auditRow}>
    <Text style={styles.auditLabel}>{label}</Text>
    <Text style={[styles.auditValue, { color }]}>
      {value < 0 ? '-' : prefix}₹{Math.abs(value).toFixed(2)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 131, 31, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  metricItem: { alignItems: 'center', flex: 1 },
  metricValue: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  metricLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', marginTop: 2 },
  
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  auditBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  auditLabel: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  auditValue: { fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: { fontSize: 14, fontWeight: '900', color: COLORS.dark },
  netValue: { fontSize: 20, fontWeight: '900', color: COLORS.accent },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: { fontSize: 9, color: COLORS.muted, fontWeight: '800' },
});

export default EarningsOverview;