import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patchTrips } from '../api/trips';
import socket from '../utils/socket';
import { getLastLocation, setLastLocation } from './locationCache';

let updateLocationInUI = null;

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const TRACKER_QUEUE_KEY = '@trip_tracker_queue_v1';
const TRACK_INTERVAL_MS = 5000;
const FOREGROUND_INTERVAL_MS = 10000;
const HEARTBEAT_MS = 15000;
const MIN_DISTANCE_METERS = 20;
const POSITION_TIMEOUT_MS = 12000;
const MAX_RETRY = 3;
const MAX_QUEUE_ITEMS = 60;

let foregroundTimer = null;
let foregroundRunning = false;

const trackerState = {
  activeTripId: null,
  lastSentAt: 0,
  lastSentCoords: null,
  queueLoaded: false,
  queue: [],
};

const toRad = (value) => (value * Math.PI) / 180;

const distanceMeters = (from, to) => {
  if (!from || !to) return Number.MAX_SAFE_INTEGER;
  const earthRadius = 6371000;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ensureLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;

  const fineLocation = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (fineLocation !== PermissionsAndroid.RESULTS.GRANTED) {
    return false;
  }

  if (Platform.Version >= 29) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
  }

  return true;
};

const getCurrentCoords = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: POSITION_TIMEOUT_MS,
        maximumAge: 3000,
      }
    );
  });

const loadQueue = async () => {
  if (trackerState.queueLoaded) return;

  try {
    const value = await AsyncStorage.getItem(TRACKER_QUEUE_KEY);
    trackerState.queue = value ? JSON.parse(value) : [];
  } catch (error) {
    trackerState.queue = [];
  } finally {
    trackerState.queueLoaded = true;
  }
};

const persistQueue = async () => {
  try {
    await AsyncStorage.setItem(TRACKER_QUEUE_KEY, JSON.stringify(trackerState.queue));
  } catch (error) {
    console.error('Queue persist failed:', error);
  }
};

const enqueuePayload = async (payload) => {
  trackerState.queue.push(payload);

  if (trackerState.queue.length > MAX_QUEUE_ITEMS) {
    trackerState.queue = trackerState.queue.slice(-MAX_QUEUE_ITEMS);
  }

  await persistQueue();
};

const sendLocationPatch = async (payload) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRY; attempt += 1) {
    try {
      console.log('response-----------------------------------');
      
      const response = await patchTrips(payload);
      if (response?.data?.success === false) {
        throw new Error(response?.data?.message || 'Trip patch rejected');
      }
      return;
    } catch (error) {
      lastError = error;
      await sleep(700 * attempt);
    }
  }

  throw lastError;
};

const flushQueue = async () => {
  while (trackerState.queue.length > 0) {
    const item = trackerState.queue[0];
    await sendLocationPatch(item);
    trackerState.queue.shift();
    await persistQueue();

    socket?.emit?.('rider:emit-track-details', item.currentLocation);
  }
};

const shouldSendUpdate = (coords) => {
  if (!trackerState.lastSentCoords || !trackerState.lastSentAt) return true;

  const elapsed = Date.now() - trackerState.lastSentAt;
  const moved = distanceMeters(trackerState.lastSentCoords, coords);

  return elapsed >= HEARTBEAT_MS || moved >= MIN_DISTANCE_METERS;
};

const buildPayload = (tripId, coords) => ({
  tripId,
  currentLocation: {
    lat: coords.lat,
    lng: coords.lng,
    updatedAt: new Date().toISOString(),
  },
});

const sendForegroundTick = async (tripId) => {
  const coords = await getCurrentCoords();
  setLastLocation(coords);

  if (updateLocationInUI) {
    updateLocationInUI(coords);
  }

  const payload = buildPayload(tripId, coords);

  console.log(
    `[LocationService][Foreground] Sending location: tripId=${tripId}, lat=${coords.lat}, lng=${coords.lng}`
  );

  await sendLocationPatch(payload);
  socket?.emit?.('rider:emit-track-details', payload.currentLocation);

  console.log(
    `[LocationService][Foreground] Success: tripId=${tripId}, updatedAt=${payload.currentLocation.updatedAt}`
  );
};

export const startForegroundLocation = async (tripId, setLocationCallback) => {
  if (!tripId) {
    throw new Error('tripId is required to start foreground location tracking');
  }

  const hasPermission = await ensureLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  updateLocationInUI = setLocationCallback || null;
  trackerState.activeTripId = tripId;

  const cached = getLastLocation();
  if (cached && updateLocationInUI) {
    updateLocationInUI(cached);
  }

  if (foregroundTimer) {
    clearInterval(foregroundTimer);
    foregroundTimer = null;
  }

  try {
    await sendForegroundTick(tripId);
  } catch (error) {
    console.error('[LocationService][Foreground] Initial send failed:', error?.message || error);
  }

  foregroundTimer = setInterval(async () => {
    if (foregroundRunning) return;

    if (AppState.currentState !== 'active') {
      console.log('[LocationService][Foreground] Skipped: app not active');
      return;
    }

    const activeTripId = trackerState.activeTripId || tripId;
    if (!activeTripId) return;

    foregroundRunning = true;

    try {
      await sendForegroundTick(activeTripId);
    } catch (error) {
      console.error('[LocationService][Foreground] Tick failed:', error?.message || error);
    } finally {
      foregroundRunning = false;
    }
  }, FOREGROUND_INTERVAL_MS);

  console.log(
    `[LocationService][Foreground] Started: tripId=${tripId}, interval=${FOREGROUND_INTERVAL_MS / 1000}s`
  );
};

export const stopForegroundLocation = async () => {
  if (foregroundTimer) {
    clearInterval(foregroundTimer);
    foregroundTimer = null;
  }

  foregroundRunning = false;
  updateLocationInUI = null;
  console.log('[LocationService][Foreground] Stopped');
};

const backgroundLocationTask = async (taskDataArguments) => {
  const taskTripId = taskDataArguments?.tripId;
  await loadQueue();

  while (BackgroundService.isRunning()) {
    const activeTripId = trackerState.activeTripId || taskTripId;
    if (!activeTripId) {
      await sleep(TRACK_INTERVAL_MS);
      continue;
    }

    try {
      const coords = await getCurrentCoords();
      setLastLocation(coords);

      if (updateLocationInUI) {
        updateLocationInUI(coords);
      }

      if (shouldSendUpdate(coords)) {
        const payload = buildPayload(activeTripId, coords);
        await enqueuePayload(payload);
        await flushQueue();

        trackerState.lastSentCoords = coords;
        trackerState.lastSentAt = Date.now();
      }
    } catch (error) {
      console.error('Background location tick failed:', error?.message || error);
    }

    await sleep(TRACK_INTERVAL_MS);
  }
};

const options = {
  taskName: 'LiveLocationTracking',
  taskTitle: 'Tracking in Background',
  taskDesc: 'We are sharing your live location.',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#a67a22ff',
  linkingURI: '', // Optional: URI to open your app on click
  parameters: {
    tripId: null,
  },
};

export const startBackgroundLocation = async (tripId, setLocationCallback) => {
  if (!tripId) {
    throw new Error('tripId is required to start location tracking');
  }

  const hasPermission = await ensureLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  updateLocationInUI = setLocationCallback || null;
  trackerState.activeTripId = tripId;

  const cached = getLastLocation();
  if (cached && updateLocationInUI) {
    updateLocationInUI(cached);
  }

  if (!BackgroundService.isRunning()) {
    await loadQueue();
    await BackgroundService.start(backgroundLocationTask, {
      ...options,
      parameters: { tripId },
    });
  } else {
    console.log('Background tracking already running. Updated active trip id.');
  }
};

export const stopBackgroundLocation = async () => {
  updateLocationInUI = null;
  trackerState.activeTripId = null;
  trackerState.lastSentAt = 0;
  trackerState.lastSentCoords = null;

  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};
