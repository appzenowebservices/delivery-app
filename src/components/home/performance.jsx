import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Palette
const COLORS = {
    dark: '#2d241e',     // Slate 900
    muted: '#a68b66',    // Slate 400
    accent: '#0c831f',   // Emerald 500
    border: '#f5ebe0',   // Gray 100
    bg: '#FFFFFF',
    card: '#fdfbf7',     // Gray 50
};

export const CurrentPerformance = ({ profile }) => {
    // These would typically come from props/API
    const todayStats = {
        earnings: '₹1,275.50',
        rides: 8,
        hours: '6.5',
        rating: 4.9,
        acceptance: '95%'
    };

    return (
        <View style={styles.section}>
            {/* Manifest Style Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Performance Analytics</Text>
                <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>Today</Text>
                </View>
            </View>

            {/* Performance Dashboard Card */}
            <View style={styles.dashboardCard}>
                <View style={styles.earningsMain}>
                    <Text style={styles.earningsLabel}>Accumulated Revenue</Text>
                    <Text style={styles.earningsAmount}>{todayStats.earnings}</Text>
                    <View style={styles.statusRow}>
                        <Icon name="trending-up" size={14} color={COLORS.accent} />
                        <Text style={styles.growthText}>+12% vs yesterday</Text>
                    </View>
                </View>

                {/* Industrial Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Icon name="truck-delivery-outline" size={18} color={COLORS.dark} />
                        <View style={styles.statTextGroup}>
                            <Text style={styles.statValue}>{todayStats.rides}</Text>
                            <Text style={styles.statLabel}>TRIPS</Text>
                        </View>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.statItem}>
                        <Icon name="clock-fast" size={18} color={COLORS.dark} />
                        <View style={styles.statTextGroup}>
                            <Text style={styles.statValue}>{todayStats.hours}h</Text>
                            <Text style={styles.statLabel}>DUTY</Text>
                        </View>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.statItem}>
                        <Icon name="star-circle-outline" size={18} color={COLORS.dark} />
                        <View style={styles.statTextGroup}>
                            <Text style={styles.statValue}>{todayStats.rating}</Text>
                            <Text style={styles.statLabel}>GRADE</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    liveBadge: {
        backgroundColor: COLORS.border,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.muted,
        textTransform: 'uppercase',
    },
    dashboardCard: {
        backgroundColor: COLORS.bg,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        // Sharp Industrial Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    earningsMain: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 20,
        marginBottom: 20,
    },
    earningsLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.muted,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    earningsAmount: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: -1,
        marginVertical: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    growthText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.accent,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statTextGroup: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '900',
        color: COLORS.dark,
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.muted,
        letterSpacing: 0.5,
    },
    verticalDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    }
});