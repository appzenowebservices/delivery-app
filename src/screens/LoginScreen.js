import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Animated
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { login } from "../api/auth";
import ToastAlert from "../components/ToastAlert";

const getLoginErrorMessage = (err) => {
    const data = err?.response?.data;

    if (data && typeof data === "object") {
        if (data.message) return data.message;
        if (data.error) return data.error;
    }

    if (err?.code === "ECONNABORTED") {
        return "Request timed out. Please check your connection and try again.";
    }
    if (!err?.response) {
        return "Network error. Please check your internet connection.";
    }

    const status = err.response.status;
    if (status === 404) return "No account found for this mobile number. Please sign up first.";
    if (status === 401 || status === 403) return "You are not authorized to log in.";
    if (status >= 500) return "Server is unavailable right now. Please try again shortly.";

    return "Unable to log in. Please try again.";
};

const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Emerald 500
    bg: '#fdfbf7',        // Slate 50
    surface: '#FFFFFF',
    border: '#e9d8bf',
};

export default function CaptainLoginScreen({ navigation }) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [alert, setAlert] = useState({ visible: false, type: "success", message: "" });
    const [success, setSuccess] = useState(false);
    const [captainName, setCaptainName] = useState("");
    const alertTimer = useRef(null);
    const redirectTimer = useRef(null);
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => () => {
        if (alertTimer.current) clearTimeout(alertTimer.current);
        if (redirectTimer.current) clearTimeout(redirectTimer.current);
    }, []);

    useEffect(() => {
        if (!success) return;
        successAnim.setValue(0);
        Animated.timing(successAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
        }).start();
    }, [success, successAnim]);

    const showAlert = (type, message, duration = 3500) => {
        if (alertTimer.current) clearTimeout(alertTimer.current);
        setAlert({ visible: true, type, message });
        alertTimer.current = setTimeout(() => {
            setAlert((prev) => ({ ...prev, visible: false }));
        }, duration);
    };

    const handleLogin = async () => {
        const mobile = phone.replace(/\D/g, "");

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            showAlert("error", "Enter a valid 10-digit mobile number");
            return;
        }

        try {
            setLoading(true);
            const res = await login(mobile);
            const token = res?.data?.token || res?.data?.data?.token;

            if (!token) {
                showAlert("error", res?.data?.message || "Unable to log in. Please try again.");
                return;
            }

            await AsyncStorage.setItem("authToken", token);
            setCaptainName(res?.data?.user?.name || "");
            setSuccess(true);
            redirectTimer.current = setTimeout(() => {
                navigation.replace("Home");
            }, 1700);
        } catch (err) {
            showAlert("error", getLoginErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
            
            {/* Dark Top Section */}
            <View style={styles.topSection}>
                <View style={styles.gridOverlay} />
                <View style={styles.brandBox}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.brandLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brandName}>CORE_STATION</Text>
                    <View style={styles.statusIndicator}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.statusText}>SYSTEM_READY</Text>
                    </View>
                </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                <View style={styles.terminalHeader}>
                    <Text style={styles.terminalTitle}>OPERATOR LOGIN</Text>
                    <Text style={styles.terminalSubtitle}>Enter registered mobile for secure access</Text>
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelWrapper}>
                        <Text style={styles.inputLabel}>IDENTITY_TOKEN</Text>
                        {phone.length === 10 && <Text style={styles.verifiedText}>VAL_OK</Text>}
                    </View>

                    <View style={[
                        styles.inputContainer, 
                        isFocused && styles.inputFocused,
                        phone.length === 10 && styles.inputSuccess
                    ]}>
                        <View style={styles.countryCode}>
                            <Text style={styles.codeText}>+91</Text>
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholder="00000 00000"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phone}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
                        />
                        {phone.length === 10 && (
                            <Icon name="check-decagram" size={20} color={COLORS.accent} style={{marginRight: 15}} />
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.authButton, (loading || success || phone.length < 10) && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading || success || phone.length < 10}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonLabel}>INITIATE SESSION</Text>
                            <Icon name="chevron-right" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    By initiating, you agree to secure protocol and data logging.
                </Text>
            </View>

            {/* Bottom Deco */}
            <View style={styles.bottomBar}>
                <View style={styles.line} />
                <Text style={styles.footerVersion}>V4.0.2_STABLE</Text>
                <View style={styles.line} />
            </View>

            <ToastAlert visible={alert.visible} type={alert.type} message={alert.message} />

            {success && (
                <Animated.View style={[styles.successOverlay, { opacity: successAnim }]}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.successLogo}
                        resizeMode="contain"
                    />
                    <View style={styles.successIconCircle}>
                        <Icon name="check-bold" size={34} color={COLORS.accent} />
                    </View>
                    <Text style={styles.successTitle}>ACCESS GRANTED</Text>
                    <Text style={styles.successSubtitle}>
                        {captainName ? `Welcome aboard, ${captainName}` : "Login successful"}
                    </Text>
                    <ActivityIndicator color={COLORS.accent} style={{ marginTop: 28 }} />
                </Animated.View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    topSection: {
        height: '42%',
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    gridOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.05,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.surface,
        // In a real app, you'd use a pattern image or repeating lines here
    },
    brandBox: { alignItems: 'center' },
    brandLogo: {
        width: 130,
        height: 130,
        marginBottom: 12,
    },
    brandName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 3,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
        marginRight: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.accent,
        letterSpacing: 1,
    },

    formSection: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    terminalHeader: { marginBottom: 32 },
    terminalTitle: { fontSize: 14, fontWeight: '900', color: COLORS.dark, letterSpacing: 1 },
    terminalSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4, fontWeight: '500' },

    inputGroup: { marginBottom: 24 },
    labelWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    inputLabel: { fontSize: 10, fontWeight: '900', color: COLORS.muted, letterSpacing: 1 },
    verifiedText: { fontSize: 10, fontWeight: '900', color: COLORS.accent },
    
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        height: 64,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    inputFocused: { borderColor: COLORS.dark, borderWidth: 1.5 },
    inputSuccess: { borderColor: COLORS.accent },
    countryCode: {
        paddingHorizontal: 18,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        height: '50%',
        justifyContent: 'center',
    },
    codeText: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
    textInput: {
        flex: 1,
        paddingHorizontal: 18,
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.dark,
        letterSpacing: 2,
    },

    authButton: {
        backgroundColor: COLORS.dark,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    buttonLabel: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },

    disclaimer: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 10,
        color: COLORS.muted,
        lineHeight: 16,
    },

    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 30,
        paddingHorizontal: 40,
        gap: 15,
    },
    line: { flex: 1, height: 1, backgroundColor: COLORS.border },
    footerVersion: { fontSize: 9, fontWeight: '800', color: COLORS.muted, letterSpacing: 2 },

    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        elevation: 20,
    },
    successLogo: {
        width: 128,
        height: 128,
        marginBottom: 24,
    },
    successIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(12, 131, 31, 0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(12, 131, 31, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 3,
    },
    successSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#c9b8a8',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});