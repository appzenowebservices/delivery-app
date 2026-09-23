import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import { getUserById } from '../api/profile';

const LocationLocator = () => {
  const [userProfile, setUserProfile] = useState([]);
  const [location, setLocation] = useState({
    address: 'Detecting location...',
    area: '',
    isLoading: true,
    hasPermission: false,
  });

  useEffect(() => {
    getUserById('home')
      .then(response => {
        setUserProfile(response?.data?.user);
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    // Check for default address with geo
    const addresses = userProfile?.address || [];
    const defaultAddr = addresses.find(addr => addr.isDefault && addr.geo && addr.geo.lat && addr.geo.lng);

    if (defaultAddr) {
      fetchAddressFromCoords(defaultAddr.geo.lat, defaultAddr.geo.lng);
    } else {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      setLocation(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'ApniDesiDukaan/1.0 (youremail@example.com)',
          },
        }
      );
      const data = await response.json();
      setLocation({
        address: data?.display_name || 'Location detected',
        area: data?.address?.suburb || data?.address?.city || '',
        isLoading: false,
        hasPermission: true,
      });
    } catch (error) {
      setLocation({
        address: 'Location not detected',
        area: 'Tap to set manually',
        isLoading: false,
        hasPermission: false,
      });
    }
  };

  const detectLocation = async () => {
    try {
      setLocation(prev => ({ ...prev, isLoading: true }));

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;

          fetchAddressFromCoords(latitude, longitude);
        },
        error => {
          setLocation({
            address: 'Location not detected',
            area: 'Tap to set manually',
            isLoading: false,
            hasPermission: false,
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    } catch (error) {
      setLocation({
        address: 'Location not detected',
        area: 'Tap to set manually',
        isLoading: false,
        hasPermission: false,
      });
    }
  };

  const handleLocationPress = () => {
    Alert.alert(
      'Change Location',
      'Choose an option',
      [
        {
          text: 'Use Current Location',
          onPress: detectLocation,
        },
        {
          text: 'Enter Manually',
          onPress: () => {
            // Navigation to manual entry screen can go here
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={handleLocationPress}
        activeOpacity={0.7}
      >
        <View style={styles.locationIcon}>
          {location.isLoading ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            <Ionicons name="location" size={16} color="#f97316" />
          )}
        </View>
        <View style={styles.locationText}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Deliver to</Text>
            <Icon name="keyboard-arrow-down" size={14} color="#666" />
          </View>
          {location.hasPermission && (
            <View style={styles.deliveryTimeContainer}>
              <View style={styles.deliveryDot} />
              <Text style={styles.deliveryTime}>
                Delivery in 10-15 mins
              </Text>
            </View>
          )}
          <Text
            style={styles.address}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location.address}
          </Text>
          {location.area ? (
            <Text
              style={styles.area}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location.area}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      {!location.hasPermission && !location.isLoading && (
        <View style={styles.locationPrompt}>
          <TouchableOpacity
            style={styles.enableLocationButton}
            onPress={detectLocation}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color="#f97316" />
            <Text
              style={styles.enableLocationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Enable Location for better experience
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};


// Styles for the LocationLocator component
const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allows it to take available space
    paddingVertical: 4,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16, // Makes it a circle
    backgroundColor: '#fff7ed', // Light orange background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationText: {
    flex: 1, // Allows text to take available space and truncate
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  deliveryLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  area: {
    fontSize: 12,
    color: '#888',
  },
  locationPrompt: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  enableLocationText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  deliveryInfo: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryDot: {
    width: 6,
    height: 6,
    borderRadius: 3, // Makes it a circle
    backgroundColor: '#22c55e', // Green dot
    marginRight: 6,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#22c55e', // Green text
    fontWeight: '500',
  },
});

export default LocationLocator;