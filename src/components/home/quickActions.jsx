import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  bg: '#FFFFFF',
  border: '#f5ebe0',
};

const ACTIONS = [
  { label: 'TRIP LOGS', caption: 'Active & archive', icon: 'clipboard-text-clock-outline', route: 'Trips', tint: '#0c831f', soft: '#eaf6ed' },
  { label: 'EARNINGS', caption: 'Payouts & report', icon: 'wallet-outline', route: 'Earnings', tint: '#b07d2b', soft: '#fdf6e4' },
  { label: 'ADDRESS BOOK', caption: 'Saved locations', icon: 'map-marker-outline', route: 'AddressBook', tint: '#2f6f8f', soft: '#e8f2f7' },
  { label: 'PROFILE', caption: 'Operator settings', icon: 'account-circle-outline', route: 'Profile', tint: '#8a5a44', soft: '#f6ece6' },
];

export const QuickActions = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.route}
          style={styles.tile}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(action.route)}
        >
          <View style={[styles.iconBox, { backgroundColor: action.soft }]}>
            <Icon name={action.icon} size={21} color={action.tint} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.label}>{action.label}</Text>
            <Text style={styles.caption}>{action.caption}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={COLORS.border} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.dark,
    letterSpacing: 0.6,
  },
  caption: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
  },
});
