// components/earnings/payments.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPayments } from '../../api/transactions';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f',
  bg: '#fdfbf7',
  surface: '#FFFFFF',
  border: '#e9d8bf',
};

const PAYOUT_TYPES = ['payout', 'withdrawal'];

const TripPayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await getPayments();
      setTransactions(res?.data?.transactions || []);
    } catch (err) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const payouts = transactions.filter(
    (t) => t.type === 'debit' && PAYOUT_TYPES.includes(t.sourceType)
  );

  const totalPaidOut = payouts.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalEarned = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const available = Math.max(0, totalEarned - totalPaidOut);

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.refBadge}>
          <Text style={styles.refText}>
            REF_{item.id.toString().slice(-6).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.methodText}>
          {item.sourceType === 'withdrawal' ? 'WITHDRAWAL' : 'ADMIN PAYOUT'}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoCol}>
          <Text style={styles.dateText}>
            {new Date(item.createdAt)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .toUpperCase()}
          </Text>
          <View style={styles.bankRow}>
            <Icon name="bank-outline" size={12} color={COLORS.muted} />
            <Text style={styles.bankText}>PRIMARY SETTLEMENT ACC</Text>
          </View>
        </View>

        <View style={styles.amountCol}>
          <Text style={styles.amountText}>
            ₹{Number(item.amount || 0).toLocaleString('en-IN')}
          </Text>
          <View style={[styles.statusPill, styles.statusSuccess]}>
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
            <Text style={[styles.statusText, { color: COLORS.accent }]}>
              SETTLED
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.dark} />;
  }

  return (
    <View style={styles.container}>
      {/* SETTLEMENT SUMMARY */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Icon name="shield-check" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.summaryLabel}>AVAILABLE FOR PAYOUT</Text>
        </View>

        <Text style={styles.payoutAmount}>
          ₹{available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>

        <View style={styles.disbursementBox}>
          <Text style={styles.disbursementText}>
            TOTAL PAID OUT: ₹{totalPaidOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>PAYOUT LOG</Text>
        <View style={styles.titleDivider} />
      </View>

      <FlatList
        data={payouts}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cash-off" size={40} color={COLORS.border} />
            <Text style={styles.emptyText}>NO PAYOUTS YET</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  summaryCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  payoutAmount: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 20,
  },
  disbursementBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disbursementText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: COLORS.muted, letterSpacing: 1 },
  titleDivider: { flex: 1, height: 1, backgroundColor: COLORS.border, marginLeft: 12 },

  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  refBadge: { backgroundColor: COLORS.dark, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  refText: { color: '#FFF', fontSize: 8, fontWeight: '900', fontFamily: 'monospace' },
  methodText: { fontSize: 8, fontWeight: '800', color: COLORS.muted },

  cardBody: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  dateText: { fontSize: 13, fontWeight: '800', color: COLORS.dark },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bankText: { fontSize: 9, color: COLORS.muted, fontWeight: '700' },

  amountCol: { alignItems: 'flex-end' },
  amountText: { fontSize: 18, fontWeight: '900', color: COLORS.dark },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusSuccess: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  statusText: { fontSize: 9, fontWeight: '900' },

  listPadding: { paddingBottom: 30 },
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { fontSize: 10, fontWeight: '900', color: COLORS.muted, marginTop: 10 },
});

export default TripPayments;
