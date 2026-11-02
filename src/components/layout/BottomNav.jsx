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

const ITEMS = [
  { name: 'Home', label: 'HOME', icon: 'home-variant-outline', activeIcon: 'home-variant' },
  { name: 'Trips', label: 'LOGS', icon: 'clipboard-text-clock-outline', activeIcon: 'clipboard-text-clock' },
  { name: 'Earnings', label: 'EARNINGS', icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'Profile', label: 'PROFILE', icon: 'account-circle-outline', activeIcon: 'account-circle' },
];

export const BottomNav = ({ active = 'Home' }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        {ITEMS.map((item) => {
          const isActive = item.name === active;

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.item, isActive && styles.itemActive]}
              activeOpacity={0.85}
              onPress={() => {
                if (!isActive) navigation.navigate(item.name);
              }}
            >
              <Icon
                name={isActive ? item.activeIcon : item.icon}
                size={20}
                color={isActive ? '#FFFFFF' : COLORS.muted}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 18,
    gap: 3,
  },
  itemActive: {
    backgroundColor: COLORS.dark,
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 0.6,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
