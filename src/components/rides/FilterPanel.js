import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

// Industrial Palette
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    bg: '#FFFFFF',
    surface: '#fdfbf7',   // Gray 50
    border: '#f5ebe0',    // Gray 100
};

export const FilterPanel = ({ filterOpen }) => (
    filterOpen && (
        <View style={styles.filterPanel}>
            <View style={styles.headerRow}>
                <Text style={styles.filterTitle}>REGISTRY FILTER</Text>
                <View style={styles.line} />
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.scrollArea}
            >
                <FilterTab label="TODAY" active />
                <FilterTab label="THIS WEEK" />
                <FilterTab label="COMPLETED" />
                <FilterTab label="CANCELLED" />
            </ScrollView>
        </View>
    )
);

const FilterTab = ({ label, active }) => (
    <TouchableOpacity 
        style={[styles.filterTab, active && styles.activeFilterTab]}
        activeOpacity={0.7}
    >
        <Text style={[styles.filterTabText, active && styles.activeFilterTabText]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    filterPanel: {
        backgroundColor: COLORS.bg,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 10,
    },
    filterTitle: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1.5,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    scrollArea: {
        paddingHorizontal: 20,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        borderRadius: 8, // Modern industrial rounding
    },
    activeFilterTab: {
        backgroundColor: COLORS.dark,
        borderColor: COLORS.dark,
    },
    filterTabText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.muted,
        letterSpacing: 0.5,
    },
    activeFilterTabText: {
        color: COLORS.bg,
    },
});