import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Palette
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#a68b66',     // Slate 400
    accent: '#0c831f',    // Emerald 500
    border: '#f5ebe0',    // Gray 100
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    info: '#2196f3',      // Blue 500
};

export const InsightsAndTips = () => {
    const weeklyStats = [
        { day: 'MON', earnings: '₹852', rides: 6 },
        { day: 'TUE', earnings: '₹1,024', rides: 7 },
        { day: 'WED', earnings: '₹1,275', rides: 8 },
        { day: 'THU', earnings: '₹943', rides: 6 },
        { day: 'FRI', earnings: '₹1,568', rides: 10 },
        { day: 'SAT', earnings: '₹2,036', rides: 12 },
        { day: 'SUN', earnings: '₹1,789', rides: 11 },
    ];

    return (
        <View style={styles.container}>
            {/* WEEKLY ACTIVITY GRID */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>7-Day Manifest History</Text>
                    <View style={styles.line} />
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
                    <View style={styles.gridSheet}>
                        {weeklyStats.map((day, index) => (
                            <View key={index} style={[styles.dayColumn, index !== weeklyStats.length - 1 && styles.borderRight]}>
                                <Text style={styles.dayName}>{day.day}</Text>
                                <Text style={styles.dayEarnings}>{day.earnings}</Text>
                                <View style={styles.statsBadge}>
                                    <Text style={styles.dayRides}>{day.rides} TRIPS</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* OPERATIONAL ADVISORY */}
            <View style={[styles.section, styles.lastSection]}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Dispatch Bulletin</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.bulletinCard}>
                    <View style={styles.bulletinHeader}>
                        <View style={styles.infoIconBox}>
                            <Icon name="lightbulb-variant-outline" size={16} color={COLORS.info} />
                        </View>
                        <Text style={styles.bulletinTitle}>STRATEGIC POSITIONING</Text>
                    </View>
                    
                    <Text style={styles.bulletinText}>
                        Peak demand detected between <Text style={styles.bold}>07:00–09:00</Text>. 
                        Carriages positioned near <Text style={styles.bold}>Business District Sector 4</Text> are 
                        seeing a 22% increase in high-value manifests.
                    </Text>
                    
                    <View style={styles.bulletinFooter}>
                        <Text style={styles.logId}>SYSTEM_REF: 8328-LKO</Text>
                        <Icon name="shield-check-outline" size={12} color={COLORS.muted} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    section: {
        marginBottom: 24,
    },
    lastSection: {
        marginBottom: 100, // Space for BottomNav
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    scrollWrapper: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    gridSheet: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingVertical: 12,
    },
    dayColumn: {
        width: 85,
        alignItems: 'center',
        paddingVertical: 8,
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        borderStyle: 'dashed',
    },
    dayName: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.muted,
        marginBottom: 4,
    },
    dayEarnings: {
        fontSize: 14,
        color: COLORS.dark,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    statsBadge: {
        marginTop: 6,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dayRides: {
        fontSize: 8,
        color: COLORS.dark,
        fontWeight: '900',
    },
    bulletinCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bulletinHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    infoIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#eaf6ed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bulletinTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 0.5,
    },
    bulletinText: {
        fontSize: 12,
        color: '#5d4037',
        lineHeight: 18,
        fontWeight: '500',
    },
    bold: {
        fontWeight: '900',
        color: COLORS.dark,
    },
    bulletinFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    logId: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.muted,
        fontFamily: 'monospace',
    },
});