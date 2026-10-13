// components/FareBreakdown.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    border: '#e9d8bf',    // Gray 200
    surface: '#fdfbf7',   // Gray 50
};

const formatFareLabel = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

const FareBreakdown = ({ fareBreakup, currency }) => {
    if (!fareBreakup || Object.keys(fareBreakup).length === 0) {
        return null;
    }

    return (
        <View style={styles.ledgerBox}>
            {Object.entries(fareBreakup).map(([key, value]) => (
                <View style={styles.fareRow} key={key}>
                    <Text style={styles.fareLabel}>{formatFareLabel(key)}</Text>
                    {/* Industrial Dotted Leader */}
                    <View style={styles.dotLeader} />
                    <Text style={styles.fareValue}>
                        {currency}{value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    ledgerBox: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed', // Gives it a "tear-off receipt" feel
    },
    fareRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 6,
    },
    fareLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.muted,
        letterSpacing: 0.5,
    },
    dotLeader: {
        flex: 1,
        height: 1,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginHorizontal: 8,
        opacity: 0.5,
    },
    fareValue: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Monospace for financial alignment
        color: COLORS.dark,
        fontWeight: '800',
    },
});

export default FareBreakdown;