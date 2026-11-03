import notifee, { AndroidImportance } from '@notifee/react-native';

export const ANDROID_CHANNEL_ID = 'custom-sound-v2';
const DEDUPE_WINDOW_MS = 2 * 60 * 1000;
const recentlyProcessedNotifications = new Map();

function pruneOldNotificationKeys(now) {
  for (const [key, timestamp] of recentlyProcessedNotifications.entries()) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      recentlyProcessedNotifications.delete(key);
    }
  }
}

function getNotificationKey(remoteMessage, title, body) {
  const notificationId = remoteMessage?.data?.notificationId;
  const orderId = remoteMessage?.data?.orderId;
  const messageId = remoteMessage?.messageId;

  if (notificationId) return `nid:${notificationId}`;
  if (orderId) return `oid:${orderId}`;
  if (messageId) return `mid:${messageId}`;

  return `tb:${title || ''}|${body || ''}`;
}

function shouldDisplayNotification(remoteMessage, title, body) {
  const now = Date.now();
  pruneOldNotificationKeys(now);

  const key = getNotificationKey(remoteMessage, title, body);
  const lastSeenAt = recentlyProcessedNotifications.get(key);

  if (lastSeenAt && now - lastSeenAt < DEDUPE_WINDOW_MS) {
    return false;
  }

  recentlyProcessedNotifications.set(key, now);
  return true;
}

export async function createCustomSoundChannel() {
  await notifee.requestPermission();

  try {
    await notifee.deleteChannel('custom-sound');
  } catch (error) {
  }

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Custom Sound Channel',
    sound: 'alert',
    importance: AndroidImportance.HIGH,
  });
}

export async function displayCustomNotification({ id, title, body, data = {} }) {
  await notifee.displayNotification({
    id,
    title: title || 'Doot',
    body: body || '',
    data,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'alert.wav',
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
}

export async function displayNotificationFromRemoteMessage(remoteMessage) {
  const title = remoteMessage?.data?.title || remoteMessage?.notification?.title;
  const body = remoteMessage?.data?.body || remoteMessage?.notification?.body;

  if (!shouldDisplayNotification(remoteMessage, title, body)) {
    return;
  }

  const id =
    remoteMessage?.data?.notificationId ||
    remoteMessage?.messageId ||
    `${Date.now()}`;

  await displayCustomNotification({
    id,
    title,
    body,
    data: remoteMessage?.data || {},
  });
}