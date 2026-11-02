// components/LeafletMapComponent.js
import React, { useRef, useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    Animated,
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

const BICYCLE_PATH = "M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.8c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 15v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z";

const LeafletMapComponent = ({
    pickupGeo,
    dropoffGeo,
    onRouteFound,
    currentLocation,
    recenterSignal,
}) => {
    const webViewRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
        }).start();
    }, [fadeAnim]);

    const toCoords = (geo) => {
        if (!geo) return null;
        const latitude = Number(geo.latitude ?? geo.lat);
        const longitude = Number(geo.longitude ?? geo.lng);
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
        return { latitude, longitude };
    };

    const safePickup = toCoords(pickupGeo);
    const safeDropoff = toCoords(dropoffGeo);

    const postToMap = (payload) => {
        webViewRef.current?.postMessage(JSON.stringify(payload));
    };

    useEffect(() => {
        if (!mapLoaded) return;

        const coords = toCoords(currentLocation);
        if (!coords) return;

        postToMap({
            type: 'update_rider',
            lat: coords.latitude,
            lng: coords.longitude,
        });
    }, [currentLocation, mapLoaded]);

    useEffect(() => {
        if (!mapLoaded || !recenterSignal) return;
        postToMap({ type: 'center_rider' });
    }, [recenterSignal, mapLoaded]);

    if (!safePickup && !safeDropoff) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.dark} />
                <Text style={styles.loadingText}>CALIBRATING TELEMETRY...</Text>
            </View>
        );
    }

    const generateMapHtml = (p1, p2) => {
        const start = p1 || p2;
        const waypointScript = p1 && p2
            ? `
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
            `
            : `
            L.marker([${start.latitude}, ${start.longitude}], {
                icon: L.divIcon({ className: 'marker-pin pickup-pin', iconSize: [12, 12] })
            }).addTo(map);
            `;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
    <style>
        html,body,#map{height:100%;width:100%;margin:0;padding:0;background:#2d241e}
        .leaflet-routing-container{display:none !important}
        .leaflet-control-attribution{
            font-size:8px;
            background:rgba(255,255,255,0.75);
            color:#2d241e;
        }
        .marker-pin {
            width: 12px; height: 12px; border-radius: 50%;
            border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .pickup-pin { background: ${COLORS.accent}; }
        .dropoff-pin { background: ${COLORS.danger}; }
        .rider-icon { background: transparent; border: none; }
        .rider-pin {
            position: relative;
            width: 34px; height: 34px; border-radius: 17px;
            background: ${COLORS.accent};
            border: 2px solid #ffffff;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        }
        .rider-pin::after {
            content: '';
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            border: 2px solid rgba(12, 131, 31, 0.45);
            animation: riderPulse 1.8s ease-out infinite;
        }
        @keyframes riderPulse {
            0% { transform: scale(0.85); opacity: 0.9; }
            100% { transform: scale(1.35); opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
    <script>
        (function () {
            var map = L.map('map', { zoomControl:false }).setView([${start.latitude}, ${start.longitude}], 15);

            // OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            ${waypointScript}

            var riderMarker = null;
            var riderIcon = L.divIcon({
                className: 'rider-icon',
                html: '<div class="rider-pin"><svg viewBox="0 0 24 24" width="16" height="16" fill="#ffffff"><path d="${BICYCLE_PATH}"/></svg></div>',
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            });

            function updateRider(lat, lng) {
                if (!riderMarker) {
                    riderMarker = L.marker([lat, lng], {
                        icon: riderIcon,
                        zIndexOffset: 1000
                    }).addTo(map);
                    map.setView([lat, lng], Math.max(map.getZoom(), 15));
                } else {
                    riderMarker.setLatLng([lat, lng]);
                }
            }

            function centerRider() {
                if (riderMarker) {
                    map.setView(riderMarker.getLatLng(), Math.max(map.getZoom(), 15));
                }
            }

            document.addEventListener('message', handleMessage);
            window.addEventListener('message', handleMessage);

            function handleMessage(e) {
                try {
                    var data = JSON.parse(e.data);
                    if (data.type === 'update_rider') updateRider(data.lat, data.lng);
                    if (data.type === 'center_rider') centerRider();
                } catch (err) { /* ignore */ }
            }

            setTimeout(function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_ready' }));
            }, 300);
        })();
    </script>
</body>
</html>`;
    };

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
                        try {
                            const payload = JSON.parse(event.nativeEvent.data);
                            if (payload.type === "map_ready") setMapLoaded(true);
                            if (payload.type === "route_found") onRouteFound?.(payload.distance, payload.duration);
                        } catch (err) { /* ignore */ }
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
        backgroundColor: COLORS.bg,
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
