// components/ToastAlert.js
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const COLORS = {
    dark: '#2d241e',
    success: '#0c831f',
    error: '#d32f2f',
    text: '#FFFFFF',
    subtext: '#e6dccf',
};

export default function ToastAlert({ visible, type = "success", message }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;
        anim.setValue(0);
        Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, [visible, anim]);

    if (!visible) return null;

    const isSuccess = type === "success";
    const accent = isSuccess ? COLORS.success : COLORS.error;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.wrapper,
                {
                    opacity: anim,
                    transform: [{
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-24, 0],
                        }),
                    }],
                },
            ]}
        >
            <View style={[styles.toast, { borderLeftColor: accent }]}>
                <View style={[styles.iconCircle, { backgroundColor: `${accent}22`, borderColor: `${accent}88` }]}>
                    <Icon
                        name={isSuccess ? "check-bold" : "alert-outline"}
                        size={18}
                        color={accent}
                    />
                </View>
                <View style={styles.textBlock}>
                    <Text style={[styles.label, { color: accent }]}>
                        {isSuccess ? "SUCCESS" : "NOTICE"}
                    </Text>
                    <Text style={styles.text}>{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 54,
        left: 16,
        right: 16,
        zIndex: 1000,
        alignItems: "center",
    },
    toast: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.dark,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: "rgba(233, 216, 191, 0.14)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 10,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textBlock: { flex: 1 },
    label: {
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 1.5,
        marginBottom: 3,
    },
    text: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
});
