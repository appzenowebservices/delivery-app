import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Design System
const COLORS = {
    bg: '#FFFFFF',
    dark: '#0F172A',     // Slate 900
    muted: '#64748B',    // Slate 500
    accent: '#10B981',   // Operational Green
    warning: '#F59E0B',  // Warning Amber
    border: '#F1F5F9',   // Gray 100
};

export const Header = ({ profile, patchProfile, socket, riderId }) => {
    const isOnline = profile?.isActive;

    const toggleOnlineStatus = async () => {
        const newStatus = !isOnline;
        if (patchProfile) {
            await patchProfile({ isActive: newStatus });
        }
        if (socket) {
            socket.emit('rider:status', { riderId, isOnline: newStatus });
        }
    };

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                {/* Captain Profile Identity */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: profile?.avatar || 'https://via.placeholder.com/150' }}
                            style={styles.profileImage}
                        />
                        <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
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
            <View style={[styles.dutyToggle, isOnline ? styles.dutyActive : styles.dutyInactive]}>
                <View style={styles.dutyLeft}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
                        <View style={styles.pulseContainer}>
                            {isOnline && <View style={styles.ping} />}
                            <View style={[styles.indicator, isOnline ? styles.bgOnline : styles.bgOffline]} />
                        </View>
                    </View>
                    <Text style={styles.statusMainText}>
                        {isOnline ? 'ONLINE & TRANSMITTING' : 'OFFLINE / STATIONED'}
                    </Text>
                </View>

                <Switch
                    value={isOnline}
                    onValueChange={toggleOnlineStatus}
                    trackColor={{ false: '#CBD5E1', true: '#D1FAE5' }}
                    thumbColor={isOnline ? COLORS.accent : '#94A3B8'}
                    ios_backgroundColor="#CBD5E1"
                />
            </View>
            
            {isOnline && (
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
        backgroundColor: '#F1F5F9',
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
    offlineDot: { backgroundColor: '#94A3B8' },
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
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#B45309',
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
        backgroundColor: '#F0FDF4',
        borderColor: '#DCFCE7',
    },
    dutyInactive: {
        backgroundColor: '#F8FAFC',
        borderColor: '#F1F5F9',
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
    bgOffline: { backgroundColor: '#94A3B8' },
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