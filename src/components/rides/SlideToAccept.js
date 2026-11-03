import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const THUMB = 46;
const PADDING = 6;
const HEIGHT = THUMB + PADDING * 2;

const COLORS = {
  track: '#2d241e',
  fill: '#0c831f',
  text: '#e6dccf',
  thumb: '#FFFFFF',
};

export default function SlideToAccept({
  onComplete,
  disabled = false,
  loading = false,
  label = 'SLIDE TO ACCEPT RIDE',
}) {
  const [travel, setTravel] = useState(0);
  const pos = useRef(new Animated.Value(0)).current;
  const travelRef = useRef(0);
  const currentRef = useRef(0);
  const busyRef = useRef(false);
  const disabledRef = useRef(disabled);
  const loadingRef = useRef(loading);

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const reset = () => {
    currentRef.current = 0;
    Animated.spring(pos, {
      toValue: 0,
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start();
  };

  const complete = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    Vibration.vibrate(20);

    Animated.timing(pos, {
      toValue: travelRef.current,
      duration: 140,
      useNativeDriver: false,
    }).start();

    try {
      const accepted = await onComplete?.();
      if (!accepted) reset();
    } finally {
      busyRef.current = false;
    }
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !disabledRef.current && !loadingRef.current,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !disabledRef.current && !loadingRef.current && gesture.dx > 3,
      onPanResponderMove: (_, gesture) => {
        const max = travelRef.current;
        const next = Math.max(0, Math.min(max, gesture.dx));
        currentRef.current = next;
        pos.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const max = travelRef.current;
        const shouldComplete =
          max > 0 && (currentRef.current >= max * 0.72 || gesture.vx > 0.6);

        if (shouldComplete) {
          complete();
        } else {
          reset();
        }
      },
      onPanResponderTerminate: reset,
    })
  ).current;

  const fillWidth = Animated.add(pos, THUMB + PADDING);
  const labelOpacity = pos.interpolate({
    inputRange: [0, Math.max(1, travel * 0.55)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, (disabled || loading) && styles.trackDisabled]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        const max = Math.max(0, width - THUMB - PADDING * 2);
        travelRef.current = max;
        setTravel(max);
      }}
      {...responder.panHandlers}
    >
      <Animated.View style={[styles.fill, { width: fillWidth }]} />

      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        {label}
      </Animated.Text>

      <Animated.View style={[styles.thumb, { transform: [{ translateX: pos }] }]}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.fill} />
        ) : (
          <Icon name="chevron-double-right" size={22} color={COLORS.fill} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: COLORS.track,
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 1,
  },
  trackDisabled: {
    opacity: 0.6,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.fill,
    opacity: 0.35,
  },
  label: {
    alignSelf: 'center',
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.4,
  },
  thumb: {
    position: 'absolute',
    left: PADDING,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: COLORS.thumb,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
