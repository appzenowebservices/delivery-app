// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfile } from '../api/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from "../../src/utils/navigationService";

const COLORS = {
  dark: '#0F172A',      // Slate 900
  muted: '#64748B',     // Slate 500
  accent: '#10B981',    // Emerald 500
  warning: '#F59E0B',   // Amber 500
  error: '#EF4444',     // Red 500
  bg: '#F8FAFC',        // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then(response => {
        setUserProfile(response?.data?.user);
      })
      .catch(error => console.error(error));
  }, []);

  const handleLogout = async () => {
    Alert.alert('SYSTEM LOGOUT', 'Deactivate current operator session?', [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'DEACTIVATE',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('authToken');
          navigate("Login");
        },
      },
    ]);
  };

  if (!userProfile) return (
    <View style={styles.loaderWrapper}>
        <Text style={styles.loaderText}>SYNCHRONIZING OPERATOR DATA...</Text>
    </View>
  );

  const menuItems = [
    {
      section: 'OPERATIONAL LOGS',
      items: [
        { icon: 'history', title: 'Voyage Archive', screen: 'Orders' },
        { icon: 'map-marker-outline', title: 'Navigation Points', screen: 'AddressBook' },
        { icon: 'file-document-outline', title: 'Tax & Compliance' },
      ],
    },
    {
      section: 'SYSTEM CONFIG',
      items: [
        { icon: 'wallet-outline', title: 'Payout Settings' },
        { icon: 'shield-cog-outline', title: 'Security Protocol' },
        { icon: 'cellphone-cog', title: 'App Configuration' },
      ],
    },
  ];

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <SafeAreaView style={{ backgroundColor: COLORS.dark }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* OPERATOR HUD HEADER */}
        <View style={styles.headerHUD}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>{userProfile?.name?.charAt(0)}</Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          
          <Text style={styles.profileName}>{userProfile?.name?.toUpperCase()}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>OPERATOR ID: {userProfile?.mobile?.slice(-4)}</Text>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.hStat}>
              <Text style={styles.hStatVal}>4.9</Text>
              <Text style={styles.hStatLabel}>RATING</Text>
            </View>
            <View style={styles.hDivider} />
            <View style={styles.hStat}>
              <Text style={styles.hStatVal}>1.2k</Text>
              <Text style={styles.hStatLabel}>TRIPS</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACCESS PANEL */}
        <View style={styles.quickGrid}>
          <QuickTile icon="lightning-bolt" label="PERFORMANCE" color={COLORS.warning} />
          <QuickTile icon="lifebuoy" label="HELPDESK" color={COLORS.accent} />
          <QuickTile icon="shield-check" label="INSURANCE" color={COLORS.muted} />
        </View>

        {/* MENU SECTIONS */}
        <View style={styles.menuContainer}>
            {menuItems.map((section, i) => (
            <View key={i} style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
                <View style={styles.sectionCard}>
                    {section.items.map((item, j) => (
                        <TouchableOpacity
                            onPress={() => item.screen && navigate(item.screen)}
                            key={j}
                            style={[styles.menuItem, j === section.items.length -1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconCircle}>
                                    <Icon name={item.icon} size={20} color={COLORS.dark} />
                                </View>
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Icon name="chevron-right" size={18} color={COLORS.border} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            ))}
        </View>

        {/* SYSTEM TERMINATION */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="power" size={20} color="#FFF" style={{marginRight: 10}} />
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>CORE_SYSTEM v4.0.2-STABLE</Text>
      </ScrollView>
    </View>
  );
};

const QuickTile = ({ icon, label, color }) => (
    <TouchableOpacity style={styles.tile}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.bg },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loaderText: { fontSize: 10, fontWeight: '900', color: COLORS.muted, letterSpacing: 2 },
  
  headerHUD: {
    backgroundColor: COLORS.dark,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    padding: 4,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    position: 'relative'
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: COLORS.dark, fontSize: 36, fontWeight: '800' },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: COLORS.dark
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  idBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  idText: { fontSize: 10, color: COLORS.muted, fontWeight: '800', fontFamily: 'monospace' },

  headerStats: {
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40
  },
  hStat: { flex: 1, alignItems: 'center' },
  hStatVal: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  hStatLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '900', marginTop: 2 },
  hDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },

  quickGrid: {
    flexDirection: 'row',
    marginTop: -25,
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 20,
    elevation: 10,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tile: { flex: 1, alignItems: 'center' },
  tileLabel: { fontSize: 9, fontWeight: '900', color: COLORS.dark, marginTop: 8, letterSpacing: 0.5 },

  menuContainer: { padding: 20, marginTop: 10 },
  menuSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, color: COLORS.muted, fontWeight: '900', marginBottom: 12, letterSpacing: 1.5 },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  menuItemText: { fontSize: 14, fontWeight: '700', color: COLORS.dark },

  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: COLORS.dark,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  versionText: { 
    textAlign: 'center', 
    fontSize: 9, 
    color: COLORS.muted, 
    marginBottom: 40,
    fontWeight: '800',
    fontFamily: 'monospace'
  },
});

export default ProfileScreen;