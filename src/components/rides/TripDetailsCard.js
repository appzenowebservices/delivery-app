// components/rides/TripDetailsCard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FareBreakdown from './FareBreakdown';

const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Emerald 500
    warning: '#e9c46a',   // Amber 500
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#e9d8bf',    // Gray 200
};

const TripDetailsCard = ({ trip, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [rotateAnim] = useState(new Animated.Value(0));

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(rotateAnim, {
            toValue: isExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.container}>
            {/* Industrial Header */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.label}>OPERATOR / CLIENT</Text>
                    <Text style={styles.customerName} numberOfLines={1}>
                        {trip?.requesterName?.toUpperCase() || 'UNASSIGNED'}
                    </Text>
                </View>
                
                <View style={styles.headerRight}>
                    <View style={styles.fareContainer}>
                        <Text style={styles.currency}>₹</Text>
                        <Text style={styles.fareAmount}>
                            {trip?.fareAmount?.toFixed(0) || '0'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={toggleExpanded}
                        activeOpacity={0.7}
                    >
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Icon name="chevron-down" size={20} color={COLORS.muted} />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Logic */}
            <View style={styles.mainContent}>
                <View style={styles.routeSummary}>
                    {/* Pickup Section */}
                    <View style={styles.pointRow}>
                        <View style={[styles.indicatorNode, { backgroundColor: COLORS.accent }]} />
                        <View style={styles.pointInfo}>
                            <Text style={styles.pointLabel}>ORIGIN</Text>
                            <Text style={styles.pointText} numberOfLines={1}>
                                {trip?.pickupLocation?.address || 'Locating...'}
                            </Text>
                        </View>
                        <Text style={styles.timeTag}>{trip?.estimatedTime || '-- min'}</Text>
                    </View>

                    {/* Visual Connector */}
                    <View style={styles.connectorLine} />

                    {/* Destination Section */}
                    <View style={styles.pointRow}>
                        <View style={[styles.indicatorNode, { backgroundColor: COLORS.dark }]} />
                        <View style={styles.pointInfo}>
                            <Text style={styles.pointLabel}>DESTINATION</Text>
                            <Text style={styles.pointText} numberOfLines={1}>
                                {trip?.dropoffLocation?.address || 'Locating...'}
                            </Text>
                        </View>
                        <Text style={styles.distTag}>{trip?.estimatedDistance || '0 km'}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <Animated.View style={styles.expandedSection}>
                        <View style={styles.separator} />
                        <Text style={styles.sectionTitle}>BILLING BREAKDOWN</Text>
                        <FareBreakdown
                            fareBreakup={trip?.fareBreakup}
                            currency={trip?.currency || '₹'}
                            themeColor={COLORS.dark}
                        />
                    </Animated.View>
                )}

                {/* This houses the TripActionPanel (Slide to Start, etc) */}
                <View style={styles.actionContainer}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.bg,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerInfo: {
        flex: 1,
    },
    label: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
        marginBottom: 2,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.dark,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    fareContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.dark,
        marginRight: 2,
    },
    fareAmount: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.dark,
    },
    expandButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        padding: 20,
    },
    routeSummary: {
        marginBottom: 20,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorNode: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 16,
    },
    pointInfo: {
        flex: 1,
    },
    pointLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.muted,
    },
    pointText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.dark,
    },
    timeTag: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.accent,
        backgroundColor: COLORS.accent + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    distTag: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.muted,
    },
    connectorLine: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.border,
        marginLeft: 3.5,
        marginVertical: 4,
    },
    expandedSection: {
        marginTop: 10,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.muted,
        marginBottom: 12,
        letterSpacing: 1,
    },
    actionContainer: {
        marginTop: 10,
    }
});

export default TripDetailsCard;