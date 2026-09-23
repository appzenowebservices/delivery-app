// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";

// Screens
import { RiderCaptainHomeScreen } from "./src/screens/Home";
import ProfileScreen from "./src/screens/Profile";
import EarningsScreen from "./src/screens/Earnings";
import TripsScreen from "./src/screens/Trips";
import MapScreen from "./src/screens/MapScreen";
import AddressBook from "./src/screens/AddressBook";
import LoginScreen from "./src/screens/LoginScreen";

// Utils
import { navigate, navigationRef } from "./src/utils/navigationService";
import {
  createCustomSoundChannel,
  displayNotificationFromRemoteMessage,
} from "./src/utils/notification";

const Stack = createNativeStackNavigator();

// Industrial Palette match
const COLORS = {
  dark: '#0F172A',
  surface: '#FFFFFF',
  accent: '#10B981', // Emerald
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkToken();
    const unsubscribeOpened = setupNotificationListeners();
    let unsubscribeForeground;

    const initNotifications = async () => {
      await createCustomSoundChannel();
      unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        await displayNotificationFromRemoteMessage(remoteMessage);
      });
    };

    initNotifications();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeOpened) unsubscribeOpened();
    };
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setInitialRoute(token ? "Home" : "Login");
    } catch (err) {
      setInitialRoute("Login");
    }
  };

  const setupNotificationListeners = () => {
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        const { screen, orderId } = remoteMessage.data;
        if (screen === "Trips" && orderId) navigate("Trips", { orderId });
      }
    });

    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage?.data) {
        const { screen, orderId } = remoteMessage.data;
        if (screen === "Trips" && orderId) navigate("Trips", { orderId });
      }
    });

    return unsubscribeOpened;
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      {initialRoute === null ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator size="large" color={COLORS.dark} />
        </View>
      ) : (
        <Stack.Navigator 
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.dark },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { 
              fontWeight: '800', 
              fontSize: 14,
              letterSpacing: 1
            },
            headerTitleAlign: 'center',
            headerShadowVisible: false, // Removes the thin line under header
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={RiderCaptainHomeScreen} 
            options={{ title: 'CORE_DASHBOARD' }} 
          />
          <Stack.Screen 
            name="MapScreen" 
            component={MapScreen} 
            options={{ title: 'NAV_HUD' }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'OPERATOR_PROFILE' }}
          />
          <Stack.Screen 
            name="Earnings" 
            component={EarningsScreen} 
            options={{ title: 'REVENUE_AUDIT' }} 
          />
          <Stack.Screen 
            name="AddressBook" 
            component={AddressBook} 
            options={{ title: 'NODE_REGISTRY' }}
          />
          <Stack.Screen 
            name="Trips" 
            component={TripsScreen} 
            options={{ title: 'LOG_MANIFEST' }} 
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}