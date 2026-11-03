import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import LeafletMapComponent from '../LeafletMap';
import SlideToAccept from './SlideToAccept';
import { acceptRide } from '../../api/trips';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f',
  danger: '#d32f2f',
  bg: '#fdfbf7',
  surface: '#FFFFFF',
  border: '#f5ebe0',
  warning: '#b07d2b',
};

const IncomingRequestModal = ({
  visible,
  trip,
  timeoutSeconds = 30,
  onAccepted,
  onReject,
  onTimeout,
}) => {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timeoutHandled = useRef(false);
  const tripKey = trip?.tripId || trip?.id || '';

  useEffect(() => {
    if (!visible) {
      Vibration.cancel();
      return;
    }

    timeoutHandled.current = false;
    setTimeLeft(timeoutSeconds);
    setLoading(false);
    slideAnim.setValue(0);

    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

    Vibration.vibrate([0, 450, 250, 450, 250, 450], true);

    return () => Vibration.cancel();
  }, [visible, tripKey, slideAnim, timeoutSeconds]);

  useEffect(() => {
    if (!visible) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, tripKey]);

  useEffect(() => {
    if (!visible || timeLeft !== 0 || timeoutHandled.current) return;
    timeoutHandled.current = true;
    Vibration.cancel();
    onTimeout?.();
  }, [timeLeft, visible, onTimeout]);

  if (!trip) return null;

  const pickup = trip.pickupLocation?.address || 'Pickup point';
  const dropoff = trip.dropoffLocation?.address || 'Drop-off point';
  const customer = trip.customer?.name || trip.requesterName || 'Customer';
  const payout = trip.fareBreakup?.totalPayable ?? trip.fareAmount ?? 0;
  const currency = trip.currency || '₹';
  const progress = Math.max(
    0,
    Math.min(1, timeLeft / Math.max(1, timeoutSeconds))
  );

  const handleAccept = async () => {
    if (loading || timeLeft === 0) return false;

    const payload = {
      tripId: trip.tripId || trip.id,
      orderId: trip.orderId || trip.order?.id,
    };

    if (!payload.orderId) {
      Alert.alert('REQUEST ERROR', 'This request has no order reference. Please ask dispatch to reassign.');
      return false;
    }

    setLoading(true);
    try {
      Vibration.cancel();
      const response = await acceptRide(payload);
      const accepted = response?.data?.trip || response?.data?.data || trip;

      onAccepted?.({
        ...trip,
        ...accepted,
        tripId: accepted?.id || trip?.tripId || trip?.id,
        dropoffLocation: accepted?.deliveryLocation || trip?.dropoffLocation,
      });

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Could not accept the request. Please try again.';
      Alert.alert('DISPATCH ERROR', message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    if (loading) return;
    Vibration.cancel();
    onReject?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleReject}>
      <View style={styles.backdrop}>
        <BlurView blurType="dark" blurAmount={25} style={StyleSheet.absoluteFill} />
        <View style={styles.tint} />

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handleBar} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.alertPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.alertPillText}>INCOMING ASSIGNMENT</Text>
              </View>

              <View style={[styles.countdownPill, timeLeft <= 10 && styles.countdownPillUrgent]}>
                <Icon name="timer-outline" size={13} color={timeLeft <= 10 ? COLORS.danger : COLORS.dark} />
                <Text style={[styles.countdownText, timeLeft <= 10 && styles.countdownTextUrgent]}>
                  {timeLeft}s
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: timeLeft <= 10 ? COLORS.danger : COLORS.accent,
                  },
                ]}
              />
            </View>

            {/* Customer + payout */}
            <View style={styles.summaryRow}>
              <View style={styles.customerBlock}>
                <View style={styles.avatar}>
                  <Icon name="account" size={20} color={COLORS.muted} />
                </View>
                <View style={styles.customerText}>
                  <Text style={styles.customerLabel}>REQUESTED BY</Text>
                  <Text style={styles.customerName} numberOfLines={1}>
                    {String(customer).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.payoutBlock}>
                <Text style={styles.payoutLabel}>EST. PAYOUT</Text>
                <Text style={styles.payoutValue}>
                  {currency} {payout}
                </Text>
              </View>
            </View>

            {/* Route */}
            <View style={styles.routeCard}>
              <View style={styles.routePath}>
                <View style={styles.nodeStart} />
                <View style={styles.connector} />
                <View style={styles.nodeEnd} />
              </View>

              <View style={styles.routeStops}>
                <View style={styles.stop}>
                  <Text style={styles.stopLabel}>PICKUP</Text>
                  <Text style={styles.stopText} numberOfLines={2}>{pickup}</Text>
                </View>
                <View style={styles.stop}>
                  <Text style={styles.stopLabel}>DROP-OFF</Text>
                  <Text style={styles.stopText} numberOfLines={2}>{dropoff}</Text>
                </View>
              </View>
            </View>

            {/* Map preview */}
            <View style={styles.mapFrame}>
              <LeafletMapComponent
                pickupGeo={{ latitude: trip?.pickupLocation?.lat, longitude: trip?.pickupLocation?.lng }}
                dropoffGeo={{ latitude: trip?.dropoffLocation?.lat, longitude: trip?.dropoffLocation?.lng }}
              />
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="map-marker-distance" size={15} color={COLORS.muted} />
                <Text style={styles.metaValue}>{trip.estimatedDistance || 'N/A'}</Text>
                <Text style={styles.metaLabel}>DISTANCE</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Icon name="clock-fast" size={15} color={COLORS.muted} />
                <Text style={styles.metaValue}>{trip.estimatedTime || 'N/A'}</Text>
                <Text style={styles.metaLabel}>EST. TIME</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Icon name="shield-check-outline" size={15} color={COLORS.muted} />
                <Text style={styles.metaValue}>VERIFIED</Text>
                <Text style={styles.metaLabel}>TRIP</Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectCircle}
              onPress={handleReject}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Reject request"
            >
              <Icon name="close" size={24} color={COLORS.muted} />
            </TouchableOpacity>

            <View style={styles.sliderWrapper}>
              <SlideToAccept
                key={tripKey}
                onComplete={handleAccept}
                disabled={timeLeft === 0}
                loading={loading}
                label="SLIDE TO ACCEPT RIDE"
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 14, 10, 0.45)',
  },
  sheet: {
    height: '75%',
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
  handleBar: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 8,
  },
  sheetContent: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef5350',
  },
  alertPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countdownPillUrgent: {
    backgroundColor: '#fdecea',
    borderColor: '#f5c6c2',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.dark,
  },
  countdownTextUrgent: {
    color: COLORS.danger,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  customerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerText: { flex: 1 },
  customerLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 2,
  },
  payoutBlock: { alignItems: 'flex-end' },
  payoutLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1,
  },
  payoutValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accent,
    marginTop: 2,
  },
  routeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 16,
  },
  routePath: {
    width: 12,
    alignItems: 'center',
    paddingTop: 4,
  },
  nodeStart: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  connector: {
    flex: 1,
    width: 1.5,
    backgroundColor: COLORS.border,
    marginVertical: 3,
    minHeight: 28,
  },
  nodeEnd: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
  },
  routeStops: {
    flex: 1,
    gap: 14,
  },
  stop: { gap: 3 },
  stopLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1,
  },
  stopText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: 18,
  },
  mapFrame: {
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metaDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.dark,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderWrapper: {
    flex: 1,
  },
});

export default IncomingRequestModal;
