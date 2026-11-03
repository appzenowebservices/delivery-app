import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IncomingRequestModal from './IncomingRequestModal';
import { getProfile } from '../../api/profile';
import { getTrips } from '../../api/trips';
import { navigate } from '../../utils/navigationService';
import socket from '../../utils/socket';
import { setIncomingRequestListener } from '../../utils/incomingRequestService';
import {
  DEFAULT_RUNTIME_CONFIG,
  loadRuntimeConfig,
} from '../../utils/runtimeConfig';

const HANDLED_KEY = 'incomingRequestsHandled_v3';
const MAX_HANDLED = 60;

const GlobalIncomingRequest = () => {
  const [request, setRequest] = useState(null);
  const [config, setConfig] = useState(DEFAULT_RUNTIME_CONFIG);
  const requestRef = useRef(null);
  const handledRef = useRef([]);
  const configRef = useRef(DEFAULT_RUNTIME_CONFIG);

  requestRef.current = request;
  configRef.current = config;

  useEffect(() => {
    let mounted = true;

    loadRuntimeConfig().then((loaded) => {
      if (mounted) setConfig(loaded);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const isHandled = useCallback((id) => {
    if (!id) return true;
    const now = Date.now();
    const fallbackTtl =
      (configRef.current?.dismissCooldownMinutes ||
        DEFAULT_RUNTIME_CONFIG.dismissCooldownMinutes) *
      60 *
      1000;

    return handledRef.current.some(
      (entry) => entry.id === id && now - entry.at < (entry.ttl || fallbackTtl)
    );
  }, []);

  const persistHandled = async (next) => {
    handledRef.current = next.slice(-MAX_HANDLED);
    try {
      await AsyncStorage.setItem(HANDLED_KEY, JSON.stringify(handledRef.current));
    } catch (error) {
      console.log('Failed to persist handled requests:', error?.message);
    }
  };

  const markHandled = useCallback(async (id, ttl) => {
    if (!id) return;
    const now = Date.now();
    const fallbackTtl =
      (configRef.current?.dismissCooldownMinutes ||
        DEFAULT_RUNTIME_CONFIG.dismissCooldownMinutes) *
      60 *
      1000;

    const next = [
      ...handledRef.current.filter(
        (entry) => entry.id !== id && now - entry.at < (entry.ttl || fallbackTtl)
      ),
      { id, at: now, ttl: ttl || fallbackTtl },
    ];
    await persistHandled(next);
  }, []);

  const offer = useCallback(
    (trip, force = false) => {
      const id = trip?.tripId || trip?.id;
      if (!id) return;
      if (!force && isHandled(id)) return;
      if (requestRef.current) return; // only one request at a time

      if (force) {
        // Vendor explicitly re-broadcast this request; clear any old dismissal.
        handledRef.current = handledRef.current.filter((entry) => entry.id !== id);
      }

      setRequest(trip);
    },
    [isHandled]
  );

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(HANDLED_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          handledRef.current = parsed.filter(
            (entry) =>
              entry?.id &&
              now - entry.at <
                (entry.ttl ||
                  DEFAULT_RUNTIME_CONFIG.dismissCooldownMinutes * 60 * 1000)
          );
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = setIncomingRequestListener(offer);

    const onSocketRequest = (payload) => {
      const item = Array.isArray(payload) ? payload[0] : payload?.data || payload;
      // A socket push is an explicit vendor broadcast — always surface it.
      offer(item, true);
    };

    socket.on('rider:rideRequest', onSocketRequest);

    const pollForAssignments = async () => {
      try {
        const profileRes = await getProfile();
        const user = profileRes?.data?.user;
        if (!user?.id || !user?.isOnline) {
          console.log('[Incoming] poll skipped', { hasUser: !!user?.id, isOnline: user?.isOnline });
          return;
        }
        if (requestRef.current) return;

        const tripsRes = await getTrips('');
        const trips = tripsRes?.data?.data || [];
        const pending = trips.find((trip) => {
          const id = trip.tripId || trip.id;
          if (!id || isHandled(id)) return false;

          const assignedToMe =
            trip.deliveryAgent === user.id && trip.status === 'assigned';
          const openOffer = !trip.deliveryAgent && trip.status === 'created';

          return assignedToMe || openOffer;
        });

        console.log('[Incoming] poll', {
          userId: user.id,
          isOnline: user.isOnline,
          trips: trips.length,
          statuses: trips.map((t) => `${t.status}:${t.deliveryAgent ? 'taken' : 'open'}`),
          pending: pending?.tripId || null,
        });

        if (pending) offer(pending);
      } catch (error) {
        console.warn('[Incoming] poll failed:', error?.message);
      }
    };

    pollForAssignments();
    const interval = setInterval(
      pollForAssignments,
      (config.pollIntervalSeconds || DEFAULT_RUNTIME_CONFIG.pollIntervalSeconds) * 1000
    );

    return () => {
      unsubscribe();
      socket.off('rider:rideRequest', onSocketRequest);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pollIntervalSeconds]);

  const handleAccepted = async (acceptedTrip) => {
    await markHandled(requestRef.current?.tripId || requestRef.current?.id);
    setRequest(null);

    navigate('MapScreen', {
      trip: acceptedTrip,
      pickupGeo: acceptedTrip?.pickupLocation,
      dropoffGeo: acceptedTrip?.dropoffLocation,
    });
  };

  const handleRejected = async () => {
    await markHandled(requestRef.current?.tripId || requestRef.current?.id);
    setRequest(null);
  };

  const handleTimedOut = async () => {
    // A missed countdown is not a rejection — let the next poll offer it again.
    setRequest(null);
  };

  return (
    <IncomingRequestModal
      visible={!!request}
      trip={request}
      timeoutSeconds={config.requestTimeoutSeconds}
      onAccepted={handleAccepted}
      onReject={handleRejected}
      onTimeout={handleTimedOut}
    />
  );
};

export default GlobalIncomingRequest;
