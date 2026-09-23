// screens/AddressBook.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AddressMap from "../components/AddressMap";
import { getProfile, patchProfile } from "../api/profile";

const COLORS = {
  dark: '#0F172A',      // Slate 900
  muted: '#64748B',     // Slate 500
  accent: '#10B981',    // Emerald 500
  bg: '#F8FAFC',        // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',
  indigo: '#6366F1',
};

export default function AddressBook() {
  const [address, setAddress] = useState<any>(null);
  const [fallbackCoords, setFallbackCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await getProfile();
      const userAddress = res?.data?.user?.addresses?.[0] || null;
      setAddress(userAddress);
      if (!userAddress?.geo) requestLocation();
    } catch (err) {
      requestLocation();
    }
  };

  const requestLocation = async () => {
    try {
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
      Geolocation.getCurrentPosition(
        (pos) => setFallbackCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geo error:", err),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) { console.log(err); }
  };

  const coords = address?.geo || fallbackCoords;

  const updateAddress = async () => {
    if (!fallbackCoords) return;
    setUpdating(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${fallbackCoords.lat}&lon=${fallbackCoords.lng}`;
      const response = await fetch(url, { headers: { "User-Agent": "ApniDesiDukaan/1.0" } });
      const data = await response.json();

      const newAddress = {
        street: data?.address?.road || "Unnamed Route",
        locality: data?.address?.suburb || data?.address?.neighbourhood || "Central District",
        city: data?.address?.city || data?.address?.town || "",
        state: data?.address?.state || "",
        pincode: data?.address?.postcode || "",
        geo: { lat: fallbackCoords.lat, lng: fallbackCoords.lng },
      };
      await patchProfile(newAddress);
      setAddress(newAddress);
    } catch (err) { 
        console.log(err); 
    } finally {
        setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HUD HEADER */}
      <View style={styles.hudHeader}>
        <View style={styles.hudLabelRow}>
          <Icon name="radar" size={14} color={COLORS.accent} />
          <Text style={styles.hudLabel}>NODE_GEO_DATA</Text>
        </View>
        {coords && (
          <Text style={styles.coordsText}>
            LAT: {coords.lat.toFixed(6)} | LNG: {coords.lng.toFixed(6)}
          </Text>
        )}
      </View>

      {/* TACTICAL MAP */}
      <View style={styles.mapWrapper}>
        {coords ? (
          <AddressMap latitude={coords.lat} longitude={coords.lng} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator color={COLORS.dark} />
            <Text style={styles.placeholderText}>SCANNING COORDINATES...</Text>
          </View>
        )}
        <View style={styles.scanLine} />
        <View style={[styles.cornerBracket, { top: 10, left: 10, borderLeftWidth: 2, borderTopWidth: 2 }]} />
        <View style={[styles.cornerBracket, { top: 10, right: 10, borderRightWidth: 2, borderTopWidth: 2 }]} />
      </View>

      {/* REGISTRY CARD */}
      <View style={styles.registryCard}>
        <View style={styles.cardIndicator} />
        <View style={styles.addressInfo}>
          {address ? (
            <>
              <Text style={styles.streetText}>
                {address.street.toUpperCase()}
              </Text>
              <Text style={styles.localityText}>
                {address.locality.toUpperCase()} • {address.city.toUpperCase()}
              </Text>
              <View style={styles.pincodeBadge}>
                <Text style={styles.pincodeText}>POSTAL_ZONE: {address.pincode}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>UNREGISTERED NODE</Text>
          )}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.statusCol}>
             <View style={styles.statusPill}>
                <View style={[styles.dot, { backgroundColor: address?.isDefault ? COLORS.accent : COLORS.indigo }]} />
                <Text style={styles.statusText}>{address?.isDefault ? 'PRIMARY_BASE' : 'STANDBY'}</Text>
             </View>
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, updating && { opacity: 0.7 }]} 
            onPress={updateAddress}
            disabled={updating}
          >
            {updating ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <>
                    <Icon name="map-marker-check" size={16} color="#FFF" />
                    <Text style={styles.btnText}>UPDATE REGISTRY</Text>
                </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.footerNote}>SATELLITE DATA SOURCE: OPENSTREETMAP API</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  
  hudHeader: {
    backgroundColor: COLORS.dark,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  hudLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  hudLabel: { fontSize: 9, fontWeight: '900', color: COLORS.accent, letterSpacing: 1.5 },
  coordsText: { fontSize: 11, color: '#FFF', fontWeight: '700', fontFamily: 'monospace', opacity: 0.8 },

  mapWrapper: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    backgroundColor: COLORS.surface,
  },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  placeholderText: { fontSize: 9, fontWeight: '900', color: COLORS.muted, letterSpacing: 1 },
  scanLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  cornerBracket: { position: 'absolute', width: 15, height: 15, borderColor: COLORS.accent, opacity: 0.5 },

  registryCard: {
    backgroundColor: COLORS.surface,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardIndicator: {
    width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20
  },
  addressInfo: { marginBottom: 25 },
  streetText: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  localityText: { fontSize: 12, fontWeight: '600', color: COLORS.muted, marginBottom: 12 },
  pincodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pincodeText: { fontSize: 9, fontWeight: '800', color: COLORS.dark, fontFamily: 'monospace' },
  emptyText: { color: '#EF4444', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.bg,
    paddingTop: 20,
  },
  statusCol: { flex: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '900', color: COLORS.dark, letterSpacing: 0.5 },
  
  actionBtn: {
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  footerNote: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 8,
    color: COLORS.muted,
    fontWeight: '700',
    letterSpacing: 1
  }
});