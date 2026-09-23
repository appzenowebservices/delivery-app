// screens/CaptainEarningsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import EarningsOverview from '../components/earnings/overview';
import TripHistory from '../components/earnings/tripHistory';
import TripPayments from '../components/earnings/payments';

const COLORS = {
  dark: '#0F172A',      // Slate 900
  muted: '#64748B',     // Slate 500
  accent: '#10B981',    // Emerald 500
  bg: '#F8FAFC',        // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',    // Slate 200
};

const CaptainEarningsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedTab, setSelectedTab] = useState('overview');

  const periods = [
    { id: 'today', label: 'TODAY' },
    { id: 'week', label: 'WEEK' },
    { id: 'month', label: 'MONTH' },
    { id: 'custom', label: 'CUSTOM' },
  ];

  const tabs = [
    { id: 'overview', label: 'ANALYTICS' },
    { id: 'trips', label: 'TRIP LOGS' },
    { id: 'payments', label: 'PAYOUTS' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Modern Industrial Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>FINANCIAL CONSOLE</Text>
          <Text style={styles.headerTitle}>Earnings Report</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>LIVE DATA</Text>
        </View>
      </View>

      {/* Period Selector: Horizontal Pill Style */}
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodPill,
                selectedPeriod === period.id && styles.activePeriodPill,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.id && styles.activePeriodText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Selector: Industrial Segmented Control */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                selectedTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {selectedTab === 'overview' && <EarningsOverview period={selectedPeriod} />}
        {selectedTab === 'trips' && <TripHistory period={selectedPeriod} />}
        {selectedTab === 'payments' && <TripPayments period={selectedPeriod} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.dark,
  },
  periodSelector: {
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
  },
  periodScroll: {
    paddingHorizontal: 20,
  },
  periodPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activePeriodPill: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.dark,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.surface,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.surface,
    // Soft shadow for the selected tab pill
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.dark,
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});

export default CaptainEarningsScreen;