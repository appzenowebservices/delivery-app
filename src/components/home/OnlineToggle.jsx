import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TRACK_W = 132;
const TRACK_H = 46;
const THUMB_SIZE = 38;
const INSET = 4;
const TRAVEL = TRACK_W - THUMB_SIZE - INSET * 2;

const COLORS = {
  offline: '#d2b48c',
  offlineDeep: '#a68b66',
  online: '#0c831f',
};

export default function OnlineToggle({ value, onToggle, disabled }) {
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;
  const valueRef = useRef(Boolean(value));
  const disabledRef = useRef(Boolean(disabled));

  useEffect(() => {
    valueRef.current = Boolean(value);
  }, [value]);

  useEffect(() => {
    disabledRef.current = Boolean(disabled);
  }, [disabled]);

  useEffect(() => {
    Animated.spring(position, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 90,
    }).start();
  }, [value, position]);

  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  const panResponder = useMemo(() => {
    const settle = (target) => {
      Animated.spring(position, {
        toValue: target,
        useNativeDriver: false,
        friction: 7,
        tension: 90,
      }).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !disabledRef.current && Math.abs(gesture.dx) > 3,
      onPanResponderMove: (_, gesture) => {
        const base = valueRef.current ? 1 : 0;
        const next = Math.min(1, Math.max(0, base + gesture.dx / TRAVEL));
        position.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const base = valueRef.current ? 1 : 0;

        // Simple tap toggles as well as swiping
        const isTap =
          Math.abs(gesture.dx) < 6 && Math.abs(gesture.dy) < 6 && Math.abs(gesture.vx) < 0.2;

        if (isTap) {
          if (disabledRef.current) {
            settle(base);
            return;
          }
          Vibration.vibrate(12);
          settle(base === 1 ? 0 : 1);
          onToggleRef.current?.();
          return;
        }

        const released = Math.min(1, Math.max(0, base + gesture.dx / TRAVEL));

        const flingTarget =
          Math.abs(gesture.vx) > 0.35 ? (gesture.vx > 0 ? 1 : 0) : null;
        const target = flingTarget !== null ? flingTarget : released >= 0.5 ? 1 : 0;
        const shouldBeOnline = target === 1;

        if (shouldBeOnline === valueRef.current || disabledRef.current) {
          settle(base);
          return;
        }

        Vibration.vibrate(12);
        settle(target);
        onToggleRef.current?.();
      },
      onPanResponderTerminate: () => {
        settle(valueRef.current ? 1 : 0);
      },
    });
  }, [position]);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  const trackColor = position.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.offline, COLORS.online],
  });

  const onlineLabelOpacity = position;
  const offlineLabelOpacity = position.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.wrapper, disabled && styles.wrapperDisabled]}>
      <Animated.View
        style={[styles.track, { backgroundColor: trackColor }]}
        {...panResponder.panHandlers}
      >
        <Animated.Text
          pointerEvents="none"
          style={[styles.label, styles.labelOn, { opacity: onlineLabelOpacity }]}
        >
          ON
        </Animated.Text>
        <Animated.Text
          pointerEvents="none"
          style={[styles.label, styles.labelOff, { opacity: offlineLabelOpacity }]}
        >
          OFF
        </Animated.Text>

        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]}>
          <Icon
            name={value ? 'lightning-bolt' : 'power'}
            size={20}
            color={value ? COLORS.online : COLORS.offlineDeep}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: TRACK_H / 2,
  },
  wrapperDisabled: {
    opacity: 0.75,
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  thumb: {
    position: 'absolute',
    left: INSET,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  labelOn: {
    left: 17,
    color: '#ffffff',
  },
  labelOff: {
    right: 15,
    color: '#6b5334',
  },
});
