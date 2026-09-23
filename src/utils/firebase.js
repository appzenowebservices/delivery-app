import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { patchProfile, postFcmToken } from '../api/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';




export const getFcmToken = async () => {
  try {
    // Request permissions (especially for iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission enabled');

      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('✅ FCM Token:', fcmToken);

        // Read saved local token
        const localKey = 'fcmTokenLocal';
        const savedToken = await AsyncStorage.getItem(localKey);

        // Only send to backend if changed
        if (savedToken !== fcmToken) {
          const resp = await postFcmToken({ fcmToken }); // [`postFcmToken`](src/api/profile.js)
          console.log('setted FCM Token ✅ ', resp);
          // Save the token locally after successful server update
          await AsyncStorage.setItem(localKey, fcmToken);
        } else {
          console.log('FCM token unchanged, skipping upload');
        }
      } else {
        console.log('❌ Failed to get FCM token');
      }
    } else {
      Alert.alert('Notification permission denied');
    }
  } catch (error) {
    console.error('🔥 FCM Error:', error);
  }
};


messaging().onMessage(async remoteMessage => {
});