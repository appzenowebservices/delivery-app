// screens/ProfileScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { getProfile, patchProfile } from '../api/profile';
import { uploadProfileImage } from '../api/uploadthing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reset, navigate } from "../../src/utils/navigationService";
import ConfirmModal from '../components/ConfirmModal';
import ToastAlert from '../components/ToastAlert';

const PROFILE_IMAGE_KEY = 'profileImageUrl';

const COLORS = {
  dark: '#2d241e',      // Slate 900
  muted: '#7d6b5d',     // Slate 500
  accent: '#0c831f',    // Emerald 500
  warning: '#e9c46a',   // Amber 500
  error: '#d32f2f',     // Red 500
  bg: '#fdfbf7',        // Slate 50
  surface: '#FFFFFF',
  border: '#e9d8bf',
};

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });
  const logoutTimer = useRef(null);
  const alertTimer = useRef(null);
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => () => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (alertTimer.current) clearTimeout(alertTimer.current);
  }, []);

  const showAlert = (type, message, duration = 3500) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ visible: true, type, message });
    alertTimer.current = setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  useEffect(() => {
    if (!loggingOut) return;
    logoutAnim.setValue(0);
    Animated.timing(logoutAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [loggingOut, logoutAnim]);

  useEffect(() => {
    getProfile()
      .then(async (response) => {
        const user = response?.data?.user;
        setUserProfile(user);

        if (user?.profileImage) {
          setAvatarUrl(user.profileImage);
          await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
        } else {
          const cached = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
          if (cached) setAvatarUrl(cached);
        }
      })
      .catch(error => console.error(error));
  }, []);

  const handlePickImage = async () => {
    if (uploading || loggingOut) return;

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Could not open the photo library.');
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setUploading(true);
      const url = await uploadProfileImage(asset);

      setAvatarUrl(url);
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, url);

      let synced = false;
      if (userProfile?.id) {
        try {
          await patchProfile(userProfile.id, { profileImage: url });
          synced = true;
        } catch (syncError) {
          console.log('Profile image sync failed:', syncError?.message);
        }
      }

      showAlert(
        'success',
        synced
          ? 'Profile photo updated.'
          : 'Photo updated on this device. Server sync is not available yet.'
      );
    } catch (err) {
      showAlert('error', err?.message || 'Could not update profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    setConfirmVisible(true);
  };

  const confirmLogout = async () => {
    setConfirmVisible(false);
    try {
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoggingOut(true);
      logoutTimer.current = setTimeout(() => {
        reset('Login');
      }, 1700);
    }
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
        { icon: 'history', title: 'Voyage Archive', caption: 'Active & archived trips', screen: 'Trips' },
        { icon: 'map-marker-outline', title: 'Navigation Points', caption: 'Saved locations', screen: 'AddressBook' },
        { icon: 'file-document-outline', title: 'Tax & Compliance', caption: 'PAN, licence & verification', section: 'tax' },
      ],
    },
    {
      section: 'SYSTEM CONFIG',
      items: [
        { icon: 'wallet-outline', title: 'Payout Settings', caption: 'UPI & bank details', section: 'payouts' },
        { icon: 'shield-cog-outline', title: 'Security Protocol', caption: 'Session & account safety', section: 'security' },
        { icon: 'cellphone-cog', title: 'App Configuration', caption: 'Build info & preferences', section: 'app' },
      ],
    },
  ];

  const openItem = (item) => {
    if (item.screen) {
      navigate(item.screen);
      return;
    }
    if (item.section) {
      navigate('ProfileSection', { section: item.section });
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <SafeAreaView style={{ backgroundColor: COLORS.dark }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* OPERATOR HUD HEADER */}
        <View style={styles.headerHUD}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarInner}
              onPress={handlePickImage}
              disabled={uploading}
              activeOpacity={0.85}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{userProfile?.name?.charAt(0)}</Text>
              )}

              {uploading && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBadge}
              onPress={handlePickImage}
              disabled={uploading}
              activeOpacity={0.85}
            >
              <Icon name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>

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
          <QuickTile icon="lightning-bolt" label="PERFORMANCE" color={COLORS.warning} onPress={() => navigate('Earnings')} />
          <QuickTile icon="lifebuoy" label="HELPDESK" color={COLORS.accent} onPress={() => navigate('ProfileSection', { section: 'support' })} />
          <QuickTile icon="shield-check" label="INSURANCE" color={COLORS.muted} onPress={() => navigate('ProfileSection', { section: 'insurance' })} />
        </View>

        {/* MENU SECTIONS */}
        <View style={styles.menuContainer}>
            {menuItems.map((section, i) => (
            <View key={i} style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
                <View style={styles.sectionCard}>
                    {section.items.map((item, j) => (
                        <TouchableOpacity
                            onPress={() => openItem(item)}
                            key={j}
                            style={[styles.menuItem, j === section.items.length -1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconCircle}>
                                    <Icon name={item.icon} size={20} color={COLORS.dark} />
                                </View>
                                <View style={styles.menuTextBlock}>
                                    <Text style={styles.menuItemText}>{item.title}</Text>
                                    <Text style={styles.menuItemCaption}>{item.caption}</Text>
                                </View>
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

      {loggingOut && (
        <Animated.View style={[styles.logoutOverlay, { opacity: logoutAnim }]}>
          <Image
            source={require('../assets/doot.png')}
            style={styles.logoutLogo}
            resizeMode="contain"
          />
          <View style={styles.logoutIconCircle}>
            <Icon name="power" size={34} color={COLORS.error} />
          </View>
          <Text style={styles.logoutTitle}>SESSION TERMINATED</Text>
          <Text style={styles.logoutSubtitle}>You have been securely logged out</Text>
          <ActivityIndicator color={COLORS.accent} style={styles.logoutSpinner} />
        </Animated.View>
      )}

      <ConfirmModal
        visible={confirmVisible}
        icon="power"
        destructive
        title="TERMINATE SESSION?"
        message="Your live location sharing will stop and you will be signed out of this device."
        confirmLabel="TERMINATE"
        cancelLabel="STAY ONLINE"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmLogout}
      />

      <ToastAlert visible={alert.visible} type={alert.type} message={alert.message} />
    </View>
  );
};

const QuickTile = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    backgroundColor: 'rgba(45, 36, 30, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  menuTextBlock: { gap: 2, flexShrink: 1 },
  menuItemText: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  menuItemCaption: { fontSize: 10, fontWeight: '600', color: COLORS.muted },

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

  logoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    elevation: 20,
  },
  logoutLogo: {
    width: 128,
    height: 128,
    marginBottom: 24,
  },
  logoutIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(211, 47, 47, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(211, 47, 47, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  logoutSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c9b8a8',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  logoutSpinner: { marginTop: 28 },
});

export default ProfileScreen;