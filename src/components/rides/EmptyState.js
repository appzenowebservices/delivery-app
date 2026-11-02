import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Industrial Palette
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Operational Green
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#f5ebe0',    // Gray 100
};

export const EmptyState = ({ variant = 'active', isOnline = false }) => {
    const isArchive = variant === 'archive';
    const isListening = !isArchive && isOnline;

    const iconName = isArchive ? 'archive-outline' : isListening ? 'radar' : 'power';
    const title = isArchive
        ? 'NO ARCHIVED TRIPS YET'
        : isListening
            ? 'STANDING BY FOR DISPATCH'
            : "YOU'RE CURRENTLY OFFLINE";

    const description = isArchive
        ? 'Completed rides will be saved here so you can review your history and earnings anytime.'
        : isListening
            ? "You're online and listening. New ride requests will land here the moment dispatch assigns one to you."
            : 'Head to the dashboard and swipe yourself online to start receiving ride requests.';

    return (
        <View style={styles.container}>
            {/* Radar Rings */}
            <View style={styles.iconContainer}>
                <View style={styles.radarRingOuter} />
                <View style={styles.radarRingInner} />
                <View style={styles.iconCircle}>
                    <Icon name={iconName} size={34} color={COLORS.dark} />
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.chipRow}>
                <View style={styles.chip}>
                    <View
                        style={[
                            styles.chipDot,
                            isListening && styles.chipDotActive,
                            isArchive && styles.chipDotArchive,
                        ]}
                    />
                    <Text style={styles.chipText}>
                        {isArchive ? 'ARCHIVE EMPTY' : isListening ? 'LISTENING' : 'DISPATCH PAUSED'}
                    </Text>
                </View>

                <View style={styles.chip}>
                    <Icon name="sync" size={12} color={COLORS.muted} />
                    <Text style={styles.chipText}>AUTO-SYNC ON</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.hintRow}>
                <Icon name="information-outline" size={13} color={COLORS.muted} />
                <Text style={styles.hintText}>
                    {isArchive
                        ? 'Deliver your first trip to start building the archive.'
                        : 'Keep the app open while online so requests reach you in real time.'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 44,
        paddingHorizontal: 24,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 26,
    },
    radarRingOuter: {
        position: 'absolute',
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.7,
    },
    radarRingInner: {
        position: 'absolute',
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.9,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 1.4,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 19,
        fontWeight: '600',
        marginTop: 10,
        maxWidth: 300,
    },
    chipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 22,
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    chipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.muted,
    },
    chipDotActive: {
        backgroundColor: COLORS.accent,
    },
    chipDotArchive: {
        backgroundColor: '#c9b8a8',
    },
    chipText: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 0.8,
    },
    divider: {
        width: 64,
        height: 1,
        backgroundColor: COLORS.border,
        marginTop: 28,
        marginBottom: 16,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        maxWidth: 300,
    },
    hintText: {
        flex: 1,
        fontSize: 10,
        color: COLORS.muted,
        fontWeight: '600',
        lineHeight: 15,
    },
});
