// components/LeafletMapComponent.js
import React, { useRef, useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";

// Industrial Palette System
const COLORS = {
    dark: '#2d241e',      // Slate 900
    muted: '#7d6b5d',     // Slate 500
    accent: '#0c831f',    // Emerald 500
    danger: '#d32f2f',    // Red 500
    bg: '#fdfbf7',        // Gray 50
    border: '#e9d8bf',    // Gray 200
};

const LeafletMapComponent = ({ pickupGeo, dropoffGeo, onRouteFound, currentLocation }) => {
    const webViewRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { 
            toValue: 1, 
            duration: 800, 
            useNativeDriver: true 
        }).start();
    }, []);

    const coordsValid = (g) => g && !isNaN(Number(g.latitude)) && !isNaN(Number(g.longitude));

    if (!coordsValid(pickupGeo) || !coordsValid(dropoffGeo)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.dark} />
                <Text style={styles.loadingText}>CALIBRATING TELEMETRY...</Text>
            </View>
        );
    }

    const safePickup = { latitude: Number(pickupGeo.latitude), longitude: Number(pickupGeo.longitude) };
    const safeDropoff = { latitude: Number(dropoffGeo.latitude), longitude: Number(dropoffGeo.longitude) };

    const generateMapHtml = (p1, p2) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
    <style>
        html,body,#map{height:100%;width:100%;margin:0;padding:0;background:#2d241e}
        .leaflet-routing-container{display:none !important}
        .marker-pin {
            width: 12px; height: 12px; border-radius: 50%;
            border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .pickup-pin { background: ${COLORS.accent}; }
        .dropoff-pin { background: ${COLORS.danger}; }
        .current-pin { 
            background: #2196f3; 
            box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.3);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
    <script>
        (function () {
            var map = L.map('map', { zoomControl:false, attributionControl: false }).setView([${p1.latitude}, ${p1.longitude}], 14);
            
            // High-Contrast Navigation Tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png').addTo(map);

            var routingControl = L.Routing.control({
                waypoints: [L.latLng(${p1.latitude}, ${p1.longitude}), L.latLng(${p2.latitude}, ${p2.longitude})],
                lineOptions: { styles: [{ color: '${COLORS.dark}', weight: 6, opacity: 0.9 }] },
                createMarker: function(i, wp) {
                    var cls = i === 0 ? 'pickup-pin' : 'dropoff-pin';
                    return L.marker(wp.latLng, {
                        icon: L.divIcon({ className: 'marker-pin ' + cls, iconSize: [12, 12] })
                    });
                },
                fitSelectedRoutes: true,
                addWaypoints: false
            }).addTo(map);

            routingControl.on('routesfound', function(e) {
                var r = e.routes[0];
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'route_found',
                    distance: (r.summary.totalDistance/1000).toFixed(1),
                    duration: Math.round(r.summary.totalTime/60)
                }));
            });

            window.addEventListener('message', function(e) {
                var data = JSON.parse(e.data);
                if(data.type === 'update_location') {
                    // Current location logic here
                }
            });

            setTimeout(() => { window.ReactNativeWebView.postMessage(JSON.stringify({ type:'map_ready' })); }, 300);
        })();
    </script>
</body>
</html>`;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* HUD Status Header */}
            <View style={styles.mapOverlayHeader}>
                <View style={styles.badge}>
                    <View style={[styles.dot, { backgroundColor: currentLocation ? COLORS.accent : COLORS.muted }]} />
                    <Text style={styles.badgeText}>
                        {currentLocation ? "GPS ACTIVE" : "SIGNALING..."}
                    </Text>
                </View>
            </View>

            <View style={styles.webWrapper}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={["*"]}
                    source={{ html: generateMapHtml(safePickup, safeDropoff) }}
                    onMessage={(event) => {
                        const payload = JSON.parse(event.nativeEvent.data);
                        if (payload.type === "map_ready") setMapLoaded(true);
                        if (payload.type === "route_found") onRouteFound?.(payload.distance, payload.duration);
                    }}
                    style={styles.webView}
                    scrollEnabled={false}
                />
                
                {!mapLoaded && (
                    <View style={styles.overlay}>
                        <ActivityIndicator color={COLORS.dark} />
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        overflow: 'hidden',
    },
    loadingContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 2,
    },
    mapOverlayHeader: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(45, 36, 30, 0.85)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    webWrapper: {
        flex: 1,
    },
    webView: {
        backgroundColor: COLORS.dark,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LeafletMapComponent;