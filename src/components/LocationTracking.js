// LocationTracker.js
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundService from 'react-native-background-actions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskDataArguments) => {
    const { delay, agentId } = taskDataArguments;
    await new Promise(async () => {
        for (let i = 0; BackgroundService.isRunning(); i++) {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Tracking agent ${agentId} at:`, latitude, longitude);

                    try {
                        await fetch('https://your-api.com/api/update-location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ agentId, latitude, longitude }),
                        });
                    } catch (err) {
                        console.error('Error updating location:', err);
                    }
                },
                (error) => {
                    console.error('Location error:', error);
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
            );

            await sleep(delay);
        }
    });
};

const options = {
    taskName: 'Live Delivery Tracker',
    taskTitle: 'Delivery in Progress',
    taskDesc: 'Your location is being tracked',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#2196f3',
    linkingURI: 'apnidesidukaan://tracking',
    parameters: {
        delay: 10000, // every 10 seconds
    },
};

const LocationTracker = ({ agentId = 'DEL-42069' }) => {
    const startTracking = async () => {
        if (!BackgroundService.isRunning()) {
            await BackgroundService.start(veryIntensiveTask, {
                ...options,
                parameters: { ...options.parameters, agentId },
            });
            Alert.alert('Tracking Started');
        }
    };

    const stopTracking = async () => {
        if (BackgroundService.isRunning()) {
            await BackgroundService.stop();
            Alert.alert('Tracking Stopped');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Delivery Agent Tracker</Text>
            <Button title="Start Location Tracking" onPress={startTracking} />
            <View style={{ marginTop: 10 }} />
            <Button title="Stop Location Tracking" color="red" onPress={stopTracking} />
        </View>
    );
};

export default LocationTracker;
