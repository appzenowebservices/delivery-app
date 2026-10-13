import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const CaptainEarningsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedTab, setSelectedTab] = useState('overview');

  const periods = [
    { id: 'today', label: 'Today', active: true },
    { id: 'week', label: 'This Week', active: false },
    { id: 'month', label: 'This Month', active: false },
    { id: 'custom', label: 'Custom', active: false },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trips', label: 'Trip History' },
    { id: 'payments', label: 'Payments' },
  ];

  // Sample data - replace with actual API data
  const earningsData = {
    today: {
      totalEarnings: 127.50,
      rides: 8,
      hours: 6.5,
      tips: 23.75,
      bonus: 15.00,
      commission: -19.13,
      netEarnings: 147.12,
    },
    week: {
      totalEarnings: 892.40,
      rides: 56,
      hours: 42.5,
      tips: 156.80,
      bonus: 85.00,
      commission: -134.16,
      netEarnings: 1000.04,
    },
    month: {
      totalEarnings: 3456.80,
      rides: 234,
      hours: 168.5,
      tips: 678.90,
      bonus: 340.00,
      commission: -518.52,
      netEarnings: 3957.18,
    }
  };

  const tripHistory = [
    {
      id: 1,
      date: '2024-01-15',
      time: '14:30',
      from: 'Downtown Mall',
      to: 'Airport Terminal 2',
      distance: '12.5 km',
      duration: '25 min',
      fare: 18.50,
      tip: 3.50,
      total: 22.00,
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '13:45',
      from: 'Central Station',
      to: 'Business District',
      distance: '8.2 km',
      duration: '18 min',
      fare: 14.20,
      tip: 2.80,
      total: 17.00,
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-15',
      time: '12:15',
      from: 'Shopping Center',
      to: 'Residential Area',
      distance: '6.8 km',
      duration: '15 min',
      fare: 12.30,
      tip: 0.00,
      total: 12.30,
      status: 'completed'
    },
    {
      id: 4,
      date: '2024-01-15',
      time: '11:20',
      from: 'Hospital',
      to: 'University Campus',
      distance: '9.4 km',
      duration: '22 min',
      fare: 16.80,
      tip: 4.20,
      total: 21.00,
      status: 'completed'
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-14',
      amount: 542.80,
      type: 'weekly_payout',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'PAY-2024-001234'
    },
    {
      id: 2,
      date: '2024-01-07',
      amount: 489.20,
      type: 'weekly_payout',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'PAY-2024-001198'
    },
    {
      id: 3,
      date: '2023-12-31',
      amount: 678.40,
      type: 'weekly_payout',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'PAY-2023-001156'
    },
  ];

  const getCurrentData = () => {
    return earningsData[selectedPeriod] || earningsData.today;
  };

  const renderOverview = () => {
    const data = getCurrentData();

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Earnings Card */}
        <LinearGradient colors={['#4a5d23', '#4a5d23']} style={styles.mainEarningsCard}>
          <View style={styles.earningsHeader}>
            <Text style={styles.earningsLabel}>Net Earnings</Text>
            <Text style={styles.mainEarningsAmount}>${data.netEarnings.toFixed(2)}</Text>
            <Text style={styles.earningsSubtext}>
              {selectedPeriod === 'today' ? 'Today' :
                selectedPeriod === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </View>

          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{data.rides}</Text>
              <Text style={styles.breakdownLabel}>Trips</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{data.hours}h</Text>
              <Text style={styles.breakdownLabel}>Online</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>${(data.totalEarnings / data.rides).toFixed(2)}</Text>
              <Text style={styles.breakdownLabel}>Per Trip</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Earnings Breakdown</Text>
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownDesc}>Trip Fares</Text>
              <Text style={styles.breakdownAmount}>+${data.totalEarnings.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownDesc}>Tips</Text>
              <Text style={[styles.breakdownAmount, styles.positiveAmount]}>+${data.tips.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownDesc}>Bonuses</Text>
              <Text style={[styles.breakdownAmount, styles.positiveAmount]}>+${data.bonus.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownDesc}>Platform Fee</Text>
              <Text style={[styles.breakdownAmount, styles.negativeAmount]}>${data.commission.toFixed(2)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalDesc}>Net Earnings</Text>
              <Text style={styles.totalAmount}>${data.netEarnings.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${(data.totalEarnings / data.hours).toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Per Hour</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{((data.tips / data.totalEarnings) * 100).toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Tips Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{(data.totalEarnings / data.rides * 1000 / 12.5).toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Per KM</Text>
            </View>
          </View>
        </View>

        {/* Goals and Incentives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Goals & Incentives</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Weekly Goal</Text>
              <Text style={styles.goalAmount}>$1,200</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(data.netEarnings / 1200) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{((data.netEarnings / 1200) * 100).toFixed(1)}% Complete</Text>
            </View>
            <Text style={styles.goalRemaining}>
              ${(1200 - data.netEarnings).toFixed(2)} remaining
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderTripHistory = () => {
    const renderTripItem = ({ item }) => (
      <View style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripTime}>
            <Text style={styles.tripDate}>{item.date}</Text>
            <Text style={styles.tripTimeText}>{item.time}</Text>
          </View>
          <Text style={styles.tripTotal}>${item.total.toFixed(2)}</Text>
        </View>

        <View style={styles.tripRoute}>
          <View style={styles.routeItem}>
            <View style={styles.pickupDot} />
            <Text style={styles.routeText}>{item.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <View style={styles.destinationDot} />
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <Text style={styles.tripDetailText}>{item.distance} • {item.duration}</Text>
          <View style={styles.tripEarnings}>
            <Text style={styles.fareText}>Fare: ${item.fare.toFixed(2)}</Text>
            {item.tip > 0 && <Text style={styles.tipText}>Tip: ${item.tip.toFixed(2)}</Text>}
          </View>
        </View>
      </View>
    );

    return (
      <FlatList
        data={tripHistory}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tripsList}
      />
    );
  };

  const renderPayments = () => {
    const renderPaymentItem = ({ item }) => (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDate}>{item.date}</Text>
            <Text style={styles.paymentMethod}>{item.method}</Text>
            <Text style={styles.paymentReference}>Ref: {item.reference}</Text>
          </View>
          <View style={styles.paymentAmount}>
            <Text style={styles.paymentAmountText}>${item.amount.toFixed(2)}</Text>
            <View style={[styles.paymentStatus,
            item.status === 'completed' ? styles.statusCompleted : styles.statusPending
            ]}>
              <Text style={[styles.statusText,
              item.status === 'completed' ? styles.statusCompletedText : styles.statusPendingText
              ]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );

    return (
      <View style={styles.paymentsContainer}>
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentSummaryTitle}>Next Payout</Text>
          <Text style={styles.nextPayoutAmount}>$147.12</Text>
          <Text style={styles.nextPayoutDate}>Expected: Monday, Jan 22</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>
        <FlatList
          data={paymentHistory}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[styles.periodButton, selectedPeriod === period.id && styles.activePeriodButton]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text style={[styles.periodButtonText,
              selectedPeriod === period.id && styles.activePeriodButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, selectedTab === tab.id && styles.activeTabButton]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[styles.tabButtonText,
            selectedTab === tab.id && styles.activeTabButtonText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'trips' && renderTripHistory()}
        {selectedTab === 'payments' && renderPayments()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9d8bf',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d241e',
    textAlign: 'center',
  },
  periodSelector: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9d8bf',
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fdfbf7',
  },
  activePeriodButton: {
    backgroundColor: '#4a5d23',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7d6b5d',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4a5d23',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7d6b5d',
  },
  activeTabButtonText: {
    color: '#4a5d23',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainEarningsCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  earningsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#ffffff80',
    fontWeight: '400',
  },
  mainEarningsAmount: {
    fontSize: 42,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 8,
  },
  earningsSubtext: {
    fontSize: 14,
    color: '#ffffff80',
    marginTop: 4,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#ffffff80',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d241e',
    marginBottom: 15,
  },
  breakdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fdfbf7',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#e9d8bf',
    marginTop: 10,
    paddingTop: 15,
  },
  breakdownDesc: {
    fontSize: 16,
    color: '#2d241e',
    fontWeight: '500',
  },
  totalDesc: {
    fontSize: 18,
    color: '#2d241e',
    fontWeight: '700',
  },
  breakdownAmount: {
    fontSize: 16,
    color: '#2d241e',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    color: '#0c831f',
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#0c831f',
  },
  negativeAmount: {
    color: '#d32f2f',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d241e',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7d6b5d',
    fontWeight: '500',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d241e',
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a5d23',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e9d8bf',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0c831f',
  },
  progressText: {
    fontSize: 14,
    color: '#7d6b5d',
    textAlign: 'center',
  },
  goalRemaining: {
    fontSize: 14,
    color: '#7d6b5d',
    textAlign: 'center',
  },
  tripsList: {
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tripTime: {
    flex: 1,
  },
  tripDate: {
    fontSize: 14,
    color: '#7d6b5d',
    fontWeight: '500',
  },
  tripTimeText: {
    fontSize: 16,
    color: '#2d241e',
    fontWeight: '600',
    marginTop: 2,
  },
  tripTotal: {
    fontSize: 20,
    color: '#0c831f',
    fontWeight: '700',
  },
  tripRoute: {
    marginBottom: 15,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0c831f',
    marginRight: 12,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d32f2f',
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e9d8bf',
    marginLeft: 5,
    marginVertical: -4,
  },
  routeText: {
    fontSize: 16,
    color: '#2d241e',
    fontWeight: '500',
    flex: 1,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDetailText: {
    fontSize: 14,
    color: '#7d6b5d',
  },
  tripEarnings: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontSize: 14,
    color: '#2d241e',
    fontWeight: '500',
  },
  tipText: {
    fontSize: 14,
    color: '#0c831f',
    fontWeight: '500',
    marginTop: 2,
  },
  paymentsContainer: {
    flex: 1,
  },
  paymentSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    marginBottom: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  paymentSummaryTitle: {
    fontSize: 16,
    color: '#7d6b5d',
    fontWeight: '500',
    marginBottom: 8,
  },
  nextPayoutAmount: {
    fontSize: 32,
    color: '#2d241e',
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPayoutDate: {
    fontSize: 14,
    color: '#7d6b5d',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 16,
    color: '#2d241e',
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#7d6b5d',
    marginBottom: 2,
  },
  paymentReference: {
    fontSize: 12,
    color: '#a68b66',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 20,
    color: '#0c831f',
    fontWeight: '700',
    marginBottom: 8,
  },
  paymentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#d3ebd8',
  },
  statusPending: {
    backgroundColor: '#faedcc',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCompletedText: {
    color: '#0a671a',
  },
  statusPendingText: {
    color: '#8a6420',
  },
});

export default CaptainEarningsScreen