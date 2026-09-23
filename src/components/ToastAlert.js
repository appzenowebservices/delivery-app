// components/ToastAlert.js
import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function ToastAlert({ visible, type = "success", message }) {
    if (!visible) return null;

    const isSuccess = type === "success";

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.toast,
                    { backgroundColor: isSuccess ? "#16a34a" : "#dc2626" },
                ]}
            >
                <Text style={styles.text}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        zIndex: 1000,
        alignItems: "center",
    },
    toast: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: "90%",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    text: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
});
