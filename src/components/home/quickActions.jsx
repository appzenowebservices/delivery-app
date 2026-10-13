import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Palette
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#a68b66',     // Slate 400
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#f5ebe0',    // Gray 100
    accent: '#0c831f',    // Operational Green
};

export const QuickActions = () => {
    const actions = [
        { id: 1, title: 'GUIDE', icon: 'map-search-outline', color: '#2196f3' },
        { id: 2, title: 'FUEL', icon: 'gas-station-outline', color: '#e9c46a' },
        { id: 3, title: 'LOGS', icon: 'clipboard-text-clock-outline', color: '#4a5d23' },
        { id: 4, title: 'AID', icon: 'hammer-wrench', color: '#d32f2f' },
    ];

    return (
        <View style={styles.section}>
            {/* Manifest Header */}
            <View style={styles.headerContainer}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>Command Console</Text>
            </View>

            <View style={styles.grid}>
                {actions.map(action => (
                    <TouchableOpacity key={action.id} style={styles.item} activeOpacity={0.7}>
                        {/* Tactile Button Base */}
                        <View style={styles.actionButton}>
                            <View style={styles.iconContainer}>
                                <Icon name={action.icon} size={24} color={COLORS.dark} />
                                {/* Status Glow Dot */}
                                <View style={[styles.statusGlow, { backgroundColor: action.color }]} />
                            </View>
                            
                            <Text style={styles.title}>{action.title}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    indicator: {
        width: 2,
        height: 12,
        backgroundColor: COLORS.dark,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    item: {
        flex: 1,
    },
    actionButton: {
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Minimal Industrial Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 8,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusGlow: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.8,
    },
    title: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.dark,
        textAlign: 'center',
        letterSpacing: 1,
    }
});