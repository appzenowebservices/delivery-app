import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { getTripMetrics } from "../../utils/geo";

// Industrial Palette System
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Emerald 500
    warning: '#e9c46a',   // Amber 500
    danger: '#d32f2f',    // Red 500
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#f5ebe0',    // Gray 100
};

const TripCard = ({ trip }) => {
    const navigation = useNavigation();
    const metrics = getTripMetrics(trip);

    return (
        <TouchableOpacity
            style={styles.registryCard}
            activeOpacity={0.85}
            onPress={() =>
                navigation.navigate("MapScreen", {
                    pickupGeo: trip?.pickupLocation
                        ? { lat: trip.pickupLocation.lat, lng: trip.pickupLocation.lng }
                        : undefined,
                    dropoffGeo: trip?.dropoffLocation
                        ? { lat: trip.dropoffLocation.lat, lng: trip.dropoffLocation.lng }
                        : undefined,
                    trip,
                })
            }
        >
            {/* Header: ID & Revenue */}
            <View style={styles.cardHeader}>
                <View style={styles.idContainer}>
                    <Text style={styles.idLabel}>ID</Text>
                    <Text style={styles.idValue}>{trip.id?.toString().slice(-6).toUpperCase() || 'N/A'}</Text>
                </View>
                <View style={styles.revenueContainer}>
                    <Text style={styles.currency}>₹</Text>
                    <Text style={styles.amount}>{trip.fareAmount}</Text>
                </View>
            </View>

            <View style={styles.body}>
                {/* Visual Path Logic */}
                <View style={styles.pathIndicator}>
                    <View style={styles.node} />
                    <View style={styles.connector} />
                    <View style={[styles.node, { backgroundColor: COLORS.danger }]} />
                </View>

                {/* Content Logic */}
                <View style={styles.locationSection}>
                    <View style={styles.locBlock}>
                        <Text style={styles.locType}>ORIGIN</Text>
                        <Text style={styles.locText} numberOfLines={1}>{trip.pickupLocation.address}</Text>
                    </View>
                    
                    <View style={styles.locBlock}>
                        <Text style={styles.locType}>DESTINATION</Text>
                        <Text style={styles.locText} numberOfLines={1}>{trip.dropoffLocation.address}</Text>
                    </View>
                </View>

                {/* Status indicator */}
                <View style={styles.statusSide}>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(trip.status) + '15', borderColor: getStatusColor(trip.status) }]}>
                        <Text style={[styles.statusPillText, { color: getStatusColor(trip.status) }]}>
                            {trip?.status?.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Metrics Footer */}
            <View style={styles.footer}>
                <View style={styles.metricGroup}>
                    <View style={styles.metric}>
                        <Icon name="schedule" size={14} color={COLORS.muted} />
                        <Text style={styles.metricText}>{metrics.etaLabel.toUpperCase()}</Text>
                    </View>
                    <View style={styles.metric}>
                        <Icon name="route" size={14} color={COLORS.muted} />
                        <Text style={styles.metricText}>{metrics.distanceLabel.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.refText}>REF: {(trip.requesterName || 'N/A').toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    registryCard: {
        backgroundColor: COLORS.bg,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        // Elevation for modern depth
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    idLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.muted,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },
    idValue: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.dark,
        fontFamily: 'monospace',
    },
    revenueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.dark,
        marginRight: 2,
    },
    amount: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.dark,
    },
    body: {
        flexDirection: 'row',
        padding: 16,
    },
    pathIndicator: {
        alignItems: 'center',
        width: 12,
        marginRight: 16,
        paddingVertical: 4,
    },
    node: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
    },
    connector: {
        flex: 1,
        width: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    locationSection: {
        flex: 1,
        gap: 12,
    },
    locBlock: {
        justifyContent: 'center',
    },
    locType: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 0.5,
    },
    locText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
        marginTop: 1,
    },
    statusSide: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
    statusPill: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusPillText: {
        fontSize: 8,
        fontWeight: '900',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    metricGroup: {
        flexDirection: 'row',
        gap: 16,
    },
    metric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.muted,
    },
    refText: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.muted,
        opacity: 0.7,
    },
});

/* Industrial Logic: Dynamic Feedback */
const getStatusColor = (s) => {
    switch (s) {
        case "assigned": return COLORS.dark;
        case "arrived_at_pickup": return COLORS.warning;
        case "picked_up": return COLORS.accent;
        case "delivered": return '#2196f3'; // Info Blue
        case "cancelled": return COLORS.danger;
        default: return COLORS.muted;
    }
};

export default TripCard;