import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import OnlineToggle from './OnlineToggle';

// Industrial Design System
const COLORS = {
    bg: '#FFFFFF',
    dark: '#2d241e',     // Slate 900
    muted: '#7d6b5d',    // Slate 500
    accent: '#0c831f',   // Operational Green
    warning: '#e9c46a',  // Warning Amber
    border: '#f5ebe0',   // Gray 100
};

export const Header = ({ profile, isOnline, onToggleOnline, toggling }) => {
    const online = Boolean(isOnline);

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                {/* Captain Profile Identity */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.avatarWrapper}>
                        <Image
                            source={
                                profile?.profileImage
                                    ? { uri: profile.profileImage }
                                    : require('../../assets/logo.png')
                            }
                            style={styles.profileImage}
                        />
                        <View style={[styles.statusDot, online ? styles.onlineDot : styles.offlineDot]} />
                    </TouchableOpacity>
                    
                    <View style={styles.identity}>
                        <View style={styles.rankBadge}>
                            <Icon name="shield-check" size={10} color={COLORS.muted} />
                            <Text style={styles.rankText}>CERTIFIED CAPTAIN</Text>
                        </View>
                        <Text style={styles.driverName}>{profile?.name?.toUpperCase()}</Text>
                        <View style={styles.vehicleRow}>
                            <Icon name="bike" size={14} color={COLORS.muted} />
                            <Text style={styles.vehicleId}>{profile?.vehicle?.number || "NO-REG"}</Text>
                        </View>
                    </View>
                </View>

                {/* Performance Snapshot */}
                <TouchableOpacity style={styles.ratingBadge}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.ratingText}>4.8</Text>
                </TouchableOpacity>
            </View>

            {/* Duty Command Console */}
            <View style={[styles.dutyToggle, online ? styles.dutyActive : styles.dutyInactive]}>
                <View style={styles.dutyLeft}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
                        <View style={styles.pulseContainer}>
                            {online && <View style={styles.ping} />}
                            <View style={[styles.indicator, online ? styles.bgOnline : styles.bgOffline]} />
                        </View>
                    </View>
                    <Text style={styles.statusMainText}>
                        {online ? 'ONLINE & TRANSMITTING' : 'OFFLINE / STATIONED'}
                    </Text>
                </View>

                <OnlineToggle
                    value={online}
                    onToggle={onToggleOnline}
                    disabled={toggling}
                />
            </View>
            
            {online && (
                <View style={styles.sessionInfo}>
                    <Icon name="clock-outline" size={12} color={COLORS.muted} />
                    <Text style={styles.sessionTime}>SESSION: {profile?.onlineTime || "00:00"} HRS</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.bg,
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#f5ebe0',
    },
    statusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: COLORS.bg,
    },
    onlineDot: { backgroundColor: COLORS.accent },
    offlineDot: { backgroundColor: '#a68b66' },
    identity: {
        gap: 2,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rankText: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: -0.5,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    vehicleId: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.muted,
        letterSpacing: 0.5,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fdf6e4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#faedcc',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#8a6420',
    },
    dutyToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    dutyActive: {
        backgroundColor: '#eaf6ed',
        borderColor: '#d3ebd8',
    },
    dutyInactive: {
        backgroundColor: '#fdfbf7',
        borderColor: '#f5ebe0',
    },
    dutyLeft: { gap: 4 },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    pulseContainer: {
        width: 8,
        height: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    bgOnline: { backgroundColor: COLORS.accent },
    bgOffline: { backgroundColor: '#a68b66' },
    ping: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.accent,
        opacity: 0.4,
    },
    statusMainText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 0.5,
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
    },
    sessionTime: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.muted,
        letterSpacing: 1,
    }
});