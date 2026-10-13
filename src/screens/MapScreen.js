import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LeafletMapComponent from '../components/LeafletMap';
import TripDetailsCard from '../components/rides/TripDetailsCard';
import TripActionPanel from '../components/rides/TripActionPanel';
import { startForegroundLocation, stopForegroundLocation } from '../services/LocationService';

const { width, height } = Dimensions.get('window');

// Industrial Palette System
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Emerald (Active)
    warning: '#e9c46a',   // Amber
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#e9d8bf',    // Gray 200
};

const MapScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { trip } = route?.params || {};
    const tripId = trip?.tripId || trip?.id;

    const [mapExpanded, setMapExpanded] = useState(false);

    // Animations
    const cardTranslateY = useRef(new Animated.Value(height * 0.4)).current;
    const mapScale = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(cardTranslateY, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    const toggleExpansion = useCallback(() => {
        const toValue = mapExpanded ? 0 : height * 0.42;

        Animated.parallel([
            Animated.spring(cardTranslateY, {
                toValue,
                friction: 8,
                tension: 40,
                useNativeDriver: true
            }),
            Animated.spring(mapScale, {
                toValue: mapExpanded ? 1 : 1.08,
                useNativeDriver: true
            })
        ]).start();

        setMapExpanded(!mapExpanded);
    }, [mapExpanded]);

    useFocusEffect(
        useCallback(() => {
            if (tripId) {
                startForegroundLocation(tripId).catch((error) => {
                    console.error('[MapScreen] startForegroundLocation failed:', error?.message || error);
                });
            }

            return () => {
                stopForegroundLocation().catch((error) => {
                    console.error('[MapScreen] stopForegroundLocation failed:', error?.message || error);
                });
            };
        }, [tripId])
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* TELEMETRY MAP LAYER */}
            <Animated.View style={[styles.mapWrapper, { transform: [{ scale: mapScale }] }]}>
                <LeafletMapComponent
                    pickupGeo={{ latitude: trip?.pickupLocation?.lat, longitude: trip?.pickupLocation?.lng }}
                    dropoffGeo={{ latitude: trip?.dropoffLocation?.lat, longitude: trip?.dropoffLocation?.lng }}
                    onRouteFound={() => { }}
                />
            </Animated.View>

            {/* HUD OVERLAY: SYSTEM CONTROLS */}
            <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.utilityBtn} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={COLORS.dark} />
                    </TouchableOpacity>

                    <View style={styles.statusBadge}>
                        <View style={[styles.pulseDot, { backgroundColor: trip?.status === "active" ? COLORS.accent : COLORS.warning }]} />
                        <Text style={styles.statusTitle}>
                            {trip?.status === "active" ? "MISSION ACTIVE" : "SYSTEM READY"}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.utilityBtn} onPress={toggleExpansion}>
                        <Icon name={mapExpanded ? "chevron-down" : "chevron-up"} size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* BOTTOM SHEET: OPERATIONAL MANIFEST */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    { transform: [{ translateY: cardTranslateY }] }
                ]}
            >
                {/* Drag Handle & Label */}
                <TouchableOpacity onPress={toggleExpansion} activeOpacity={1} style={styles.sheetHandleArea}>
                    <View style={styles.handleBar} />
                    <Text style={styles.manifestLabel}>OPERATIONAL MANIFEST — {trip?.id?.toString().slice(-6).toUpperCase()}</Text>
                </TouchableOpacity>

                <View style={styles.cardContent}>
                    <TripDetailsCard trip={trip}>
                        <TripActionPanel
                            trip={trip}
                            onTripStatusUpdate={() => { }}
                        />
                    </TripDetailsCard>
                </View>

                {/* Footer Padding for Gestures */}
                <View style={styles.footerSpacer} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    mapWrapper: {
        flex: 1,
        width: width,
        height: height,
    },
    topOverlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 10 : 30,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    utilityBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        backgroundColor: COLORS.dark,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusTitle: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 30,
    },
    sheetHandleArea: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        marginBottom: 8,
    },
    manifestLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 10 : 5,
    },
    footerSpacer: {
        height: Platform.OS === 'ios' ? 34 : 15,
        backgroundColor: COLORS.bg,
    }
});

export default MapScreen;