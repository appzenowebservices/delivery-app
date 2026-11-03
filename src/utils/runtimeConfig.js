import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppConfig } from '../api/appConfig';

const STORAGE_KEY = 'runtimeConfig';

export const DEFAULT_RUNTIME_CONFIG = {
  requestTimeoutSeconds: 30,
  dismissCooldownMinutes: 360,
  pollIntervalSeconds: 15,
};

const clampInt = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const sanitize = (raw) => ({
  requestTimeoutSeconds: clampInt(
    raw?.requestTimeoutSeconds,
    10,
    300,
    DEFAULT_RUNTIME_CONFIG.requestTimeoutSeconds
  ),
  dismissCooldownMinutes: clampInt(
    raw?.dismissCooldownMinutes,
    1,
    1440,
    DEFAULT_RUNTIME_CONFIG.dismissCooldownMinutes
  ),
  pollIntervalSeconds: clampInt(
    raw?.pollIntervalSeconds,
    5,
    300,
    DEFAULT_RUNTIME_CONFIG.pollIntervalSeconds
  ),
});

let cached = null;

export const getCachedRuntimeConfig = () => cached || DEFAULT_RUNTIME_CONFIG;

export const loadRuntimeConfig = async () => {
  if (!cached) {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) cached = sanitize(JSON.parse(stored));
    } catch (error) {
      // Ignore malformed cache and fall through to defaults/API.
    }
  }

  try {
    const response = await getAppConfig();
    cached = sanitize(response?.data?.config);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch (error) {
    // Offline or old backend: keep the cached/default values.
  }

  return cached || DEFAULT_RUNTIME_CONFIG;
};
