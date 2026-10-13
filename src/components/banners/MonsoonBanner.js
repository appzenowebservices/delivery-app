import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Industrial Palette
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#a68b66',     // Slate 400
    accent: '#0c831f',    // Emerald 500
    warning: '#e9c46a',   // Warning Amber
    bg: '#FFFFFF',
    border: '#f5ebe0',    // Gray 100
};

const MonsoonBanner = () => {
    return (
        <View style={styles.bannerContainer}>
            {/* Background Image with Industrial Tint */}
            <Image
                source={require('../../assets/banner/banner.png')}
                style={styles.bannerImage}
                resizeMode="cover"
            />
            
            {/* Gradient-like Overlay for Legibility */}
            <View style={styles.overlay}>
                <View style={styles.topRow}>
                    <View style={styles.alertBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.alertText}>OPERATIONAL ADVISORY</Text>
                    </View>
                    <Icon name="weather-pouring" size={20} color="#FFF" />
                </View>

                <View style={styles.contentBox}>
                    <Text style={styles.title}>MONSOON RIDE MANIA</Text>
                    <Text style={styles.subtitle}>
                        RENT EV SCOOTERS • EARN RAIN SURGE PAY
                    </Text>
                    
                    <View style={styles.footerRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>LIMITED SLOTS</Text>
                        </View>
                        <Icon name="chevron-right" size={16} color={COLORS.warning} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        width: '100%',
        height: 180,
        alignSelf: 'center',
        marginVertical: 20,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: COLORS.dark,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5, // Darkened for text pop
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 20,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(45, 36, 30, 0.3)', // Slate tint
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 8,
        backdropFilter: 'blur(4px)', // For supported platforms
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.warning,
    },
    alertText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    contentBox: {
        gap: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.warning,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10,
    },
    tag: {
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.dark,
    }
});

export default MonsoonBanner;