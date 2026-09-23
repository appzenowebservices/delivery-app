import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar
} from 'react-native';


export const SummaryCards = () => (
    <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryAmount}>₹1,247</Text>
            <Text style={styles.summaryLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryAmount}>12</Text>
            <Text style={styles.summaryLabel}>Trips Completed</Text>
        </View>
    </View>
);


const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
});
