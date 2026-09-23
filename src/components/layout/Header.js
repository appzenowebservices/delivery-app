import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LocationLocator from '../LocationLocator';
import { useNavigation } from '@react-navigation/native';

const LocationHeader = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenu = () => {
        navigation.navigate('Profile');
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.container}>
                {/* Top Row: Menu + Location */}
                <View style={styles.headerContent}>
                    <View style={styles.leftSection}>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={handleMenu}
                            activeOpacity={0.7}
                        >
                            <Icon name="person" size={24} color="#333" />
                        </TouchableOpacity>
                        <LocationLocator />
                    </View>
                </View>

                {/* Second Row: Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products, categories..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'ios' ? 50 : 10,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuButton: {
        padding: 8,
        marginRight: 8,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    searchInput: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
    },
});

export default LocationHeader;
