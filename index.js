import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import {
  createCustomSoundChannel,
  displayNotificationFromRemoteMessage,
} from './src/utils/notification';

// FCM background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await createCustomSoundChannel();

  if (remoteMessage?.notification) {
    return;
  }

  await displayNotificationFromRemoteMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);