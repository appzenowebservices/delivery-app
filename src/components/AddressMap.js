// components/AddressMap.js
import React, { useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

const AddressMap = ({ latitude, longitude }) => {
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const generateMapHtml = (lat, lng) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
            }
            #mapid {
                height: 100vh;   /* ✅ full viewport height */
                width: 100%;
            }
        </style>
    </head>
    <body>
        <div id="mapid"></div>

        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
            var map = L.map('mapid').setView([${lat}, ${lng}], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Marker
            L.marker([${lat}, ${lng}]).addTo(map);

            // Circle radius 100m
            L.circle([${lat}, ${lng}], {
                color: 'blue',
                fillColor: '#007bff33',
                fillOpacity: 0.4,
                radius: 100
            }).addTo(map);

            // Notify RN
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_ready' }));
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "map_ready") {
        setMapLoaded(true);
      }
    } catch (err) {
      console.log("WebView message parse error", err);
    }
  };

  if (!latitude || !longitude) {
    return (
      <View style={styles.loadingContainer}>
        <Text>📍 Location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading Map...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        style={{ flex: 1 }}   // ✅ fill parent (no fixed height here)
        originWhitelist={["*"]}
        source={{ html: generateMapHtml(latitude, longitude) }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,   // ✅ This controls visible height
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
    backgroundColor: "#e0e0e0",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default AddressMap;
