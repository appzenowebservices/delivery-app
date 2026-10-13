import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const BottomNavigation = ({ profile, navigate }) => {
    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity
                onPress={() => navigate.navigate('Earnings')}
                style={styles.navItem}>
                <Text style={styles.navIcon}>📊</Text>
                <Text style={styles.navLabel}>Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigate.navigate('Trips')}
                style={styles.navItem}>
                <Text style={styles.navIcon}>🚗</Text>
                <Text style={styles.navLabel}>Trips</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigate.navigate('Profile')}
                style={styles.navItem}>
                <Text style={styles.navIcon}>👤</Text>
                <Text style={styles.navLabel}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9d8bf',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        zIndex: 100,
    },

    navItem: {
        flex: 1,
        alignItems: 'center',
    },

    navIcon: {
        fontSize: 20,
        marginBottom: 4,
    },

    navLabel: {
        fontSize: 12,
        color: '#7d6b5d',
        fontWeight: '500',
    },
});
