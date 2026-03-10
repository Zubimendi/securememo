import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import { Svg, Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/theme';

/* ── Icons ── */

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
    </Svg>
  );
}

function CheckCircleIcon({ size = 16, color = COLORS.vaultTeal }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
  );
}

function FingerprintIcon({ color = COLORS.vaultTeal }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.5 12c0 2.5-3 3.5-3 5.5v1.5M12 20.5V19c0-2.5-3-3-3-5.5M7 11c0-3.5 1.5-6 5-6s5 2.5 5 6M9.5 8.5C6 9.5 4 12.5 4 16M20 16c0-3.5-2-6.5-5.5-7.5" />
      <Path d="M14 6c-3-2-6-2-8 0" />
    </Svg>
  );
}

function VerifiedUserIcon({ color = COLORS.vaultTeal }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="M9 12l2 2 4-4" />
    </Svg>
  );
}

function TimerIcon({ color = COLORS.vaultTeal }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="12 7 12 12 15 12" />
      <Path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" />
    </Svg>
  );
}

function InfoIcon({ color = COLORS.textDim }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Line x1="12" y1="8" x2="12.01" y2="8" />
    </Svg>
  );
}

function ClipboardOffIcon({ color = COLORS.vaultTeal }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Line x1="4" y1="4" x2="20" y2="20" />
    </Svg>
  );
}

function WarningIcon({ color = COLORS.red }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}

function LockResetIcon({ color = COLORS.red }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </Svg>
  );
}

function LogoutIcon({ color = COLORS.red }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  );
}

function DeleteForeverIcon({ color = COLORS.red }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="14" y2="17" />
      <Line x1="14" y1="11" x2="10" y2="17" />
    </Svg>
  );
}

function ChevronRightIcon({ color = COLORS.textDim }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

export default function SecurityScreen() {
  const router = useRouter();
  
  const [biometricUnlock, setBiometricUnlock] = useState(true);
  const [biometricSensitive, setBiometricSensitive] = useState(true);
  const [clipboardClear, setClipboardClear] = useState(true);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <Text style={styles.title}>Security</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Security Score Card ── */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreGradeContainer}>
              <Text style={styles.scoreGradeText}>A+</Text>
            </View>
            <View style={styles.scoreDetails}>
              <View>
                <Text style={styles.scoreLabel}>Security Score</Text>
                <View style={styles.checkIconsRow}>
                  <CheckCircleIcon />
                  <CheckCircleIcon />
                  <CheckCircleIcon />
                  <CheckCircleIcon />
                </View>
              </View>
              <Text style={styles.scoreStatus}>Excellent security posture</Text>
            </View>
          </View>
        </View>

        {/* ── Biometrics ── */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>BIOMETRICS</Text>
          <View style={styles.settingsBlock}>
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <FingerprintIcon />
                <Text style={styles.settingRowText}>Biometric Unlock</Text>
              </View>
              <Switch
                value={biometricUnlock}
                onValueChange={setBiometricUnlock}
                trackColor={{ false: '#334155', true: COLORS.vaultTeal }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <VerifiedUserIcon />
                <Text style={styles.settingRowText}>Require Biometrics for Sensitive Actions</Text>
              </View>
              <Switch
                value={biometricSensitive}
                onValueChange={setBiometricSensitive}
                trackColor={{ false: '#334155', true: COLORS.vaultTeal }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* ── Auto-Lock ── */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>AUTO-LOCK</Text>
          <Pressable style={[styles.settingsBlock, styles.settingRow]}>
            <View style={styles.settingRowLeft}>
              <TimerIcon />
              <Text style={styles.settingRowText}>Auto-Lock Timeout</Text>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={styles.settingRowValueText}>5 minutes</Text>
              <ChevronRightIcon />
            </View>
          </Pressable>
        </View>

        {/* ── Encryption Specs ── */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>ENCRYPTION SPECS</Text>
          <View style={styles.settingsBlock}>
            <View style={styles.specRow}>
              <View style={styles.specDetails}>
                <Text style={styles.specLabel}>Encryption Algorithm</Text>
                <Text style={styles.specValueMono}>AES-256-GCM</Text>
              </View>
              <InfoIcon />
            </View>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <View style={styles.specDetails}>
                <Text style={styles.specLabel}>Key Derivation</Text>
                <Text style={styles.specValueMono}>Argon2id</Text>
              </View>
              <InfoIcon />
            </View>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <View style={styles.specDetails}>
                <Text style={styles.specLabel}>Memory Hardness</Text>
                <Text style={styles.specValueMono}>64 MB</Text>
              </View>
              <InfoIcon />
            </View>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <View style={styles.specDetails}>
                <Text style={styles.specLabel}>Key Location</Text>
                <Text style={styles.specValue}>Device Keychain Only</Text>
              </View>
              <InfoIcon />
            </View>
          </View>
        </View>

        {/* ── Clipboard ── */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>CLIPBOARD</Text>
          <View style={[styles.settingsBlock, styles.settingRow]}>
            <View style={styles.settingRowLeft}>
              <ClipboardOffIcon />
              <Text style={styles.settingRowText}>Auto-clear clipboard after 30s</Text>
            </View>
            <Switch
              value={clipboardClear}
              onValueChange={setClipboardClear}
              trackColor={{ false: '#334155', true: COLORS.vaultTeal }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Danger Zone ── */}
        <View style={[styles.sectionGroup, { marginTop: 8 }]}>
          <View style={styles.dangerZoneBox}>
            <View style={styles.dangerZoneHeader}>
              <WarningIcon />
              <Text style={styles.dangerZoneTitle}>DANGER ZONE</Text>
            </View>
            
            <View style={styles.dangerActions}>
              <Pressable style={styles.dangerActionRow}>
                <Text style={styles.dangerActionText}>Change Master Password</Text>
                <LockResetIcon />
              </Pressable>
              
              <Pressable style={styles.dangerActionRow}>
                <Text style={styles.dangerActionText}>Revoke All Active Sessions</Text>
                <LogoutIcon />
              </Pressable>
              
              <Pressable style={styles.dangerActionRow}>
                <Text style={styles.dangerActionText}>Reset Vault</Text>
                <DeleteForeverIcon />
              </Pressable>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d14', // Using the dark mode background
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e293b', // border-dark
    backgroundColor: 'rgba(12, 13, 20, 0.8)', // background-dark with blur effect conceptually
    gap: 16,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Accommodate bottom nav visually if accessed through stack/tabs
  },

  /* Security Score Section */
  scoreSection: {
    padding: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#0d1021', // card-dark matching
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreGradeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreGradeText: {
    fontSize: 48,
    color: '#22c55e', // accent-green
  },
  scoreDetails: {
    flex: 1,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  checkIconsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  scoreStatus: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22c55e',
  },

  /* Sections */
  sectionGroup: {
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.footerText, // text-header mapped to footerText from theme
    letterSpacing: 1,
    paddingHorizontal: 24,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  settingsBlock: {
    backgroundColor: 'transparent',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingRight: 16,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingRowText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  settingRowValueText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#111827', // border-dark relative mapping for subtle internal divs
    marginLeft: 64, // visually align under text
  },

  /* Encryption Specs Layout */
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  specDetails: {
    flexDirection: 'column', // React Native specific: 'column'
    gap: 2,
  },
  specLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.vaultTeal,
  },
  specValueMono: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.vaultTeal,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  /* Danger Zone */
  dangerZoneBox: {
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ef4444', // danger-border
    backgroundColor: '#1a0a0a', // danger-bg
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    gap: 8,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dangerZoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
  },
  dangerActions: {
    gap: 4,
  },
  dangerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  dangerActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
});
