// components/ConfirmModal.js
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  dark: '#2d241e',
  surface: '#3a2f27',
  muted: '#c9b8a8',
  accent: '#0c831f',
  error: '#d32f2f',
  border: 'rgba(233, 216, 191, 0.18)',
};

export default function ConfirmModal({
  visible,
  title = 'ARE YOU SURE?',
  message,
  icon = 'alert-circle-outline',
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  destructive = false,
  onCancel,
  onConfirm,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity: anim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={[styles.iconCircle, destructive && styles.iconCircleDanger]}>
            <Icon
              name={icon}
              size={32}
              color={destructive ? COLORS.error : COLORS.accent}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                destructive && styles.confirmButtonDanger,
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 10, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(12, 131, 31, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(12, 131, 31, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircleDanger: {
    backgroundColor: 'rgba(211, 47, 47, 0.12)',
    borderColor: 'rgba(211, 47, 47, 0.55)',
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(233, 216, 191, 0.35)',
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
  },
  confirmButtonDanger: {
    backgroundColor: COLORS.error,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 1.2,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
