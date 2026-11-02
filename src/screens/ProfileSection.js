import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getProfile, patchProfile } from '../api/profile';
import { uploadFile } from '../api/uploadthing';
import { reset } from '../utils/navigationService';
import { baseURL } from '../config';
import ConfirmModal from '../components/ConfirmModal';
import ToastAlert from '../components/ToastAlert';
import appPackage from '../../package.json';

const COLORS = {
  dark: '#2d241e',
  muted: '#7d6b5d',
  accent: '#0c831f',
  warning: '#b07d2b',
  danger: '#d32f2f',
  bg: '#fdfbf7',
  surface: '#FFFFFF',
  border: '#f5ebe0',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const SUPPORT_EMAIL = 'support@apnidesidukaan.com';

const DOCUMENT_TYPES = [
  { key: 'pan', label: 'PAN CARD', icon: 'card-account-details-outline' },
  { key: 'aadhaar', label: 'AADHAAR CARD', icon: 'identifier' },
  { key: 'licence', label: 'DRIVING LICENCE', icon: 'card-account-details' },
  { key: 'vehicle', label: 'VEHICLE RC', icon: 'car-info' },
];

const mask = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length <= 4) return raw;
  return `${raw.slice(0, 2)}••••${raw.slice(-2)}`;
};

const formatDate = (value) => {
  if (!value) return 'Not on record';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not on record';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const tone = (ok, fallback = 'warning') => (ok ? 'success' : fallback);

const SECTIONS = {
  tax: {
    title: 'Tax & Compliance',
    subtitle: 'Statutory records linked to your operator account',
    icon: 'file-document-outline',
    build: (p) => [
      {
        title: 'COMPLIANCE STATUS',
        rows: [
          {
            label: 'ACCOUNT APPROVAL',
            value: p?.isApproved ? 'Approved' : 'Pending review',
            tone: tone(p?.isApproved),
          },
          {
            label: 'VERIFICATION',
            value: p?.isVerified ? 'Verified' : 'Pending',
            tone: tone(p?.isVerified),
          },
          {
            label: 'DUTY STATUS',
            value: p?.isOnline ? 'Online' : 'Offline',
            tone: p?.isOnline ? 'success' : 'muted',
          },
        ],
      },
    ],
    note: 'Statutory records are reviewed by the operations desk. Contact support to correct any detail.',
  },

  payouts: {
    title: 'Payout Settings',
    subtitle: 'How your trip earnings are settled',
    icon: 'wallet-outline',
    build: (p) => [
      {
        title: 'SETTLEMENT METHOD',
        rows: [
          {
            label: 'PAYOUT MODE',
            value: p?.UPIid ? 'UPI' : p?.bankAccountDetailsId ? 'Bank transfer' : 'Not configured',
            tone: p?.UPIid || p?.bankAccountDetailsId ? 'success' : 'warning',
          },
          { label: 'UPI ID', value: p?.UPIid || 'Not linked' },
          {
            label: 'BANK ACCOUNT',
            value: p?.bankAccountDetailsId ? 'Linked' : 'Not linked',
            tone: p?.bankAccountDetailsId ? 'success' : 'muted',
          },
          { label: 'SETTLEMENT CYCLE', value: 'As per finance cycle' },
        ],
      },
      {
        title: 'ACCOUNT',
        rows: [
          { label: 'OPERATOR', value: p?.name || '—' },
          { label: 'REGISTERED MOBILE', value: mask(p?.mobile) || '—' },
        ],
      },
    ],
    note: 'Payout changes are verified by the finance desk before they take effect.',
    action: {
      label: 'EMAIL FINANCE DESK',
      icon: 'email-outline',
      url: `mailto:${SUPPORT_EMAIL}?subject=Payout%20settings%20request`,
    },
  },

  security: {
    title: 'Security Protocol',
    subtitle: 'Session safety for your operator account',
    icon: 'shield-cog-outline',
    build: (p) => [
      {
        title: 'ACCOUNT',
        rows: [
          { label: 'REGISTERED MOBILE', value: mask(p?.mobile) || '—' },
          {
            label: 'ACCOUNT STATUS',
            value: p?.isApproved ? 'Approved' : 'Pending review',
            tone: tone(p?.isApproved),
          },
          {
            label: 'VERIFICATION',
            value: p?.isVerified ? 'Verified' : 'Pending',
            tone: tone(p?.isVerified),
          },
        ],
      },
      {
        title: 'SESSION',
        rows: [
          { label: 'CURRENT DEVICE', value: Platform.OS === 'ios' ? 'iOS device' : 'Android device' },
          { label: 'SESSION STATE', value: 'Active', tone: 'success' },
          { label: 'LAST PROFILE SYNC', value: formatDate(p?.updatedAt) },
        ],
      },
    ],
    note: 'Never share your OTP or session. Terminate the session immediately if this device is lost.',
    action: {
      label: 'TERMINATE SESSION',
      icon: 'power',
      danger: true,
      type: 'logout',
    },
  },

  app: {
    title: 'App Configuration',
    subtitle: 'Build details and runtime preferences',
    icon: 'cellphone-cog',
    build: (p) => [
      {
        title: 'BUILD',
        rows: [
          { label: 'APP VERSION', value: `v${appPackage.version}` },
          { label: 'ENGINE', value: 'React Native + Hermes' },
          { label: 'PLATFORM', value: Platform.OS.toUpperCase() },
        ],
      },
      {
        title: 'RUNTIME',
        rows: [
          { label: 'API HOST', value: baseURL.replace(/^https?:\/\//, '') },
          {
            label: 'DUTY STATE',
            value: p?.isOnline ? 'Online' : 'Offline',
            tone: p?.isOnline ? 'success' : 'muted',
          },
          {
            label: 'PUSH NOTIFICATIONS',
            value: p?.fcmToken ? 'Linked' : 'Not linked',
            tone: p?.fcmToken ? 'success' : 'warning',
          },
        ],
      },
    ],
    note: 'Reinstalling or clearing app data signs you out and removes locally cached profile images.',
  },

  support: {
    title: 'Helpdesk',
    subtitle: 'Get help with trips, payouts and your account',
    icon: 'lifebuoy',
    build: () => [
      {
        title: 'CONTACT',
        rows: [
          { label: 'EMAIL', value: SUPPORT_EMAIL },
          { label: 'HOURS', value: 'Mon–Sat · 9:00–19:00 IST' },
        ],
      },
      {
        title: 'COMMON ISSUES',
        rows: [
          {
            label: 'NO TRIPS APPEARING',
            stacked: true,
            value: 'Make sure you are swiped online on the dashboard and that notifications are enabled for the app.',
          },
          {
            label: 'EARNINGS MISMATCH',
            stacked: true,
            value: 'Earnings are recorded once a trip is marked delivered. Check the Earnings report for the fare breakdown.',
          },
          {
            label: 'ACCOUNT APPROVAL',
            stacked: true,
            value: 'New operator accounts need admin approval before login. Contact support if approval is delayed.',
          },
        ],
      },
    ],
    note: 'Include your registered mobile number and a screenshot when you write in.',
    action: {
      label: 'EMAIL SUPPORT',
      icon: 'email-outline',
      url: `mailto:${SUPPORT_EMAIL}?subject=Operator%20support%20request`,
    },
  },

  insurance: {
    title: 'Operator Insurance',
    subtitle: 'Coverage and protection for your rides',
    icon: 'shield-check',
    build: () => [
      {
        title: 'COVERAGE TYPES',
        rows: [
          { label: 'THIRD-PARTY LIABILITY', stacked: true, value: 'Mandatory on-road liability cover for the vehicle used on duty.' },
          { label: 'RIDER ACCIDENT COVER', stacked: true, value: 'Accident and disability protection for the operator while on a trip.' },
          { label: 'VEHICLE PROTECTION', stacked: true, value: 'Optional damage and breakdown protection for your vehicle.' },
        ],
      },
      {
        title: 'NEXT STEP',
        rows: [
          { label: 'POLICY DOCUMENT', stacked: true, value: 'Contact operations with your vehicle registration number to receive your active policy copy.' },
        ],
      },
    ],
    note: 'Coverage is activated by the operations team after document verification.',
    action: {
      label: 'REQUEST POLICY COPY',
      icon: 'shield-plus-outline',
      url: `mailto:${SUPPORT_EMAIL}?subject=Insurance%20policy%20request`,
    },
  },
};

const TONES = {
  success: { bg: '#eaf6ed', text: '#0c831f' },
  warning: { bg: '#fdf6e4', text: '#b07d2b' },
  muted: { bg: '#f5ebe0', text: '#7d6b5d' },
};

const Row = ({ row, last }) => {
  if (row.stacked) {
    return (
      <View style={[styles.row, styles.rowStacked, !last && styles.rowBorder]}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowValueFull}>{row.value}</Text>
      </View>
    );
  }

  const toneStyle = row.tone ? TONES[row.tone] : null;

  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{row.label}</Text>
      {toneStyle ? (
        <View style={[styles.chip, { backgroundColor: toneStyle.bg }]}>
          <Text style={[styles.chipText, { color: toneStyle.text }]}>{row.value}</Text>
        </View>
      ) : (
        <Text style={styles.rowValue} numberOfLines={2}>
          {row.value}
        </Text>
      )}
    </View>
  );
};

export default function ProfileSectionScreen({ route }) {
  const sectionKey = route?.params?.section || 'tax';
  const section = SECTIONS[sectionKey] || SECTIONS.tax;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingType, setUploadingType] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });
  const alertTimer = useRef(null);

  useEffect(() => () => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
  }, []);

  const showAlert = (type, message, duration = 3500) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ visible: true, type, message });
    alertTimer.current = setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  useEffect(() => {
    let mounted = true;

    getProfile()
      .then((response) => {
        if (!mounted) return;
        const user = response?.data?.user || null;
        setProfile(user);
        setDocuments(Array.isArray(user?.documents) ? user.documents : []);
      })
      .catch((error) => console.log('Profile section sync failed:', error?.message))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(() => section.build(profile), [section, profile]);

  const pickDocument = async (source) => {
    const docType = pickerFor;
    setPickerFor(null);
    if (!docType) return;

    try {
      if (source === 'camera' && Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showAlert('error', 'Camera permission is required to capture a document.');
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      };

      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Could not open the document picker.');
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setUploadingType(docType.key);
      const url = await uploadFile(asset);

      const nextDocuments = [
        ...documents.filter((doc) => doc.type !== docType.key),
        {
          type: docType.key,
          label: docType.label,
          url,
          uploadedAt: new Date().toISOString(),
          verified: false,
        },
      ];

      setDocuments(nextDocuments);

      let synced = false;
      if (profile?.id) {
        try {
          await patchProfile(profile.id, { documents: nextDocuments });
          synced = true;
        } catch (error) {
          console.log('Document sync failed:', error?.message);
        }
      }

      showAlert(
        'success',
        synced
          ? `${docType.label} uploaded successfully.`
          : `${docType.label} uploaded on this device. Server sync pending.`
      );
    } catch (error) {
      showAlert('error', error?.message || 'Could not upload the document.');
    } finally {
      setUploadingType(null);
    }
  };

  const confirmLogout = async () => {
    setConfirmVisible(false);
    await AsyncStorage.removeItem('authToken');
    reset('Login');
  };

  const runAction = () => {
    const action = section.action;
    if (!action) return;

    if (action.type === 'logout') {
      setConfirmVisible(true);
      return;
    }

    if (action.url) {
      Linking.openURL(action.url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name={section.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>{section.title}</Text>
          <Text style={styles.heroSubtitle}>{section.subtitle}</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={COLORS.dark} />
            <Text style={styles.loadingText}>LOADING RECORDS...</Text>
          </View>
        ) : (
          <>
            {sectionKey === 'tax' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>COMPLIANCE DOCUMENTS</Text>

                {DOCUMENT_TYPES.map((docType, index) => {
                  const uploaded = documents.find((doc) => doc.type === docType.key);
                  const isUploading = uploadingType === docType.key;
                  const isVerified = uploaded?.verified === true;
                  const statusLabel = !uploaded
                    ? 'NOT UPLOADED'
                    : isVerified
                      ? 'VERIFIED'
                      : 'PENDING REVIEW';

                  return (
                    <View
                      key={docType.key}
                      style={[
                        styles.docRow,
                        index !== DOCUMENT_TYPES.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={styles.docIcon}>
                        <Icon name={docType.icon} size={18} color={COLORS.dark} />
                      </View>

                      <View style={styles.docText}>
                        <Text style={styles.docLabel}>{docType.label}</Text>
                        <Text
                          style={[
                            styles.docMeta,
                            isVerified && styles.docMetaVerified,
                            uploaded && !isVerified && styles.docMetaPending,
                          ]}
                        >
                          {uploaded
                            ? `${statusLabel} • ${formatDate(uploaded.uploadedAt)}`
                            : statusLabel}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.uploadButton, isUploading && styles.uploadButtonBusy]}
                        onPress={() => setPickerFor(docType)}
                        disabled={!!uploadingType}
                        activeOpacity={0.85}
                      >
                        {isUploading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.uploadText}>
                            {uploaded ? 'REPLACE' : 'UPLOAD'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <Text style={styles.docHint}>
                  Upload clear photos (JPG/PNG). Documents are verified by the operations desk.
                </Text>
              </View>
            )}

            {groups.map((group) => (
              <View key={group.title} style={styles.card}>
                <Text style={styles.cardTitle}>{group.title}</Text>
                {group.rows.map((row, index) => (
                  <Row key={row.label} row={row} last={index === group.rows.length - 1} />
                ))}
              </View>
            ))}
          </>
        )}

        {section.action && (
          <TouchableOpacity
            style={[styles.action, section.action.danger && styles.actionDanger]}
            onPress={runAction}
            activeOpacity={0.85}
          >
            <Icon name={section.action.icon} size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>{section.action.label}</Text>
          </TouchableOpacity>
        )}

        {section.note && (
          <View style={styles.note}>
            <Icon name="information-outline" size={14} color={COLORS.muted} />
            <Text style={styles.noteText}>{section.note}</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!pickerFor}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPickerFor(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Icon name="file-upload-outline" size={26} color={COLORS.accent} />
            </View>

            <Text style={styles.modalTitle}>UPLOAD {pickerFor?.label}</Text>
            <Text style={styles.modalSubtitle}>
              Choose how to add your document photo.
            </Text>

            <TouchableOpacity
              style={styles.modalPrimary}
              onPress={() => pickDocument('camera')}
              activeOpacity={0.85}
            >
              <Icon name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.modalPrimaryText}>TAKE PHOTO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondary}
              onPress={() => pickDocument('gallery')}
              activeOpacity={0.85}
            >
              <Icon name="image-multiple-outline" size={18} color="#e6dccf" />
              <Text style={styles.modalSecondaryText}>CHOOSE FROM GALLERY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setPickerFor(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ToastAlert visible={alert.visible} type={alert.type} message={alert.message} />

      <ConfirmModal
        visible={confirmVisible}
        icon="power"
        destructive
        title="TERMINATE SESSION?"
        message="You will be signed out of this device and live location sharing will stop."
        confirmLabel="TERMINATE"
        cancelLabel="CANCEL"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 48 },
  hero: {
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    padding: 22,
    marginBottom: 4,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c9b8a8',
    marginTop: 6,
    lineHeight: 18,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  loadingText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1.4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 13,
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.muted,
    letterSpacing: 0.9,
    flexShrink: 1,
  },
  rowValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'right',
  },
  rowValueFull: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 18,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: COLORS.dark,
    height: 54,
    borderRadius: 16,
    marginTop: 20,
  },
  actionDanger: {
    backgroundColor: COLORS.danger,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    lineHeight: 16,
  },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: {
    flex: 1,
    gap: 2,
  },
  docLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.dark,
    letterSpacing: 0.6,
  },
  docMeta: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.4,
  },
  docMetaVerified: {
    color: COLORS.accent,
  },
  docMetaPending: {
    color: COLORS.warning,
  },
  uploadButton: {
    minWidth: 84,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  uploadButtonBusy: {
    backgroundColor: '#5b4a3d',
  },
  uploadText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  docHint: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.muted,
    lineHeight: 15,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 10, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(233, 216, 191, 0.18)',
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(12, 131, 31, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(12, 131, 31, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c9b8a8',
    marginTop: 8,
    textAlign: 'center',
  },
  modalPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    marginTop: 22,
  },
  modalPrimaryText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(233, 216, 191, 0.25)',
    marginTop: 10,
  },
  modalSecondaryText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#e6dccf',
    letterSpacing: 0.8,
  },
  modalCancel: {
    paddingVertical: 12,
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a68b66',
    letterSpacing: 1,
  },
});
