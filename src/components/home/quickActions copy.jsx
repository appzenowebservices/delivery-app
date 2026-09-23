import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const QuickActions = () => {
    const actions = [
        { id: 1, title: 'Navigation', emoji: '🗺️', color: '#4CAF50' },
        { id: 2, title: 'Find Gas', emoji: '⛽', color: '#2196F3' },
        { id: 3, title: 'Analytics', emoji: '📊', color: '#FF9800' },
        { id: 4, title: 'Support', emoji: '🛠️', color: '#9C27B0' },
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

            <View style={styles.grid}>
                {actions.map(action => (
                    <TouchableOpacity key={action.id} style={styles.item}>
                        <View style={[styles.icon, { backgroundColor: action.color }]}>
                            <Text style={styles.emoji}>{action.emoji}</Text>
                        </View>
                        <Text style={styles.title}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emoji: {
        fontSize: 26,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
});
