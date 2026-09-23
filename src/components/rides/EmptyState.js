import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Palette
const COLORS = {
    dark: '#0F172A',      // Slate 900
    muted: '#64748B',     // Slate 500
    accent: '#10B981',    // Operational Green
    bg: '#FFFFFF',
    surface: '#F8FAFC',   // Gray 50
    border: '#F1F5F9',    // Gray 100
};

export const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
        {/* Signal Search Hub */}
        <View style={styles.iconContainer}>
            <View style={styles.radarRing} />
            <View style={styles.iconCircle}>
                <Icon name="radar" size={36} color={COLORS.dark} />
            </View>
        </View>

        <Text style={styles.emptyStateTitle}>NO ACTIVE MANIFESTS</Text>
        
        <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM STANDBY</Text>
        </View>

        <Text style={styles.emptyStateDescription}>
            YOUR TRIP LOG IS CURRENTLY VOID.{"\n"}
            ESTABLISH AN UPLINK TO SYNC WITH DISPATCH.
        </Text>

        <TouchableOpacity style={styles.resumeButton} activeOpacity={0.8}>
            <Text style={styles.resumeButtonText}>RESUME DUTY</Text>
            <Icon name="arrow-right" size={18} color={COLORS.bg} />
        </TouchableOpacity>

        <View style={styles.footerInfo}>
            <Text style={styles.footerNote}>SIGNAL ID: LKO-TERMINAL-01</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    radarRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.8,
    },
    iconCircle: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        // Soft Modern Elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    emptyStateTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 1.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.muted,
        marginRight: 8,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    emptyStateDescription: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '600',
        marginBottom: 32,
    },
    resumeButton: {
        backgroundColor: COLORS.dark,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 14,
        gap: 10,
    },
    resumeButtonText: {
        color: COLORS.bg,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    footerInfo: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        width: '40%',
        alignItems: 'center',
    },
    footerNote: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.muted,
        letterSpacing: 0.5,
        fontFamily: 'monospace',
    },
});