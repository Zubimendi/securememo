import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { Svg, Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/theme';

/* ── Icons ── */

function MoreVertIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.textDim} stroke="none">
      <Path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </Svg>
  );
}

function ChevronRightIcon({ color = COLORS.textDim }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function KeyIcon() {
  // accent-amber
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </Svg>
  );
}

function PhoneLinkRingIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <Line x1="12" y1="18" x2="12.01" y2="18" />
    </Svg>
  );
}

function SyncIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
    </Svg>
  );
}

function DownloadIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Polyline points="7 10 12 15 17 10" />
      <Line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
  );
}

function UploadIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Polyline points="17 8 12 3 7 8" />
      <Line x1="12" y1="3" x2="12" y2="15" />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Settings</Text>
            <Pressable style={styles.iconButton}>
              <MoreVertIcon />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>You have 47 notes · 2.3 MB encrypted</Text>
        </View>

        {/* ── User Info Card ── */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>U</Text>
            </View>
            <View style={styles.userInfoRight}>
              <View style={styles.userInfoTopRow}>
                <Text style={styles.userEmail}>user@example.com</Text>
                <Pressable>
                  <Text style={styles.accountLink}>Account →</Text>
                </Pressable>
              </View>
              <Text style={styles.vaultCreated}>Vault created: Dec 2024</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionsContainer}>
          {/* ── Vault Security ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>VAULT SECURITY</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row} onPress={() => router.push('/settings/security')}>
                <ShieldIcon />
                <Text style={styles.rowLabel}>Security Settings</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <KeyIcon />
                <Text style={styles.rowLabel}>Change Master Password</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <PhoneLinkRingIcon />
                <Text style={styles.rowLabel}>View Recovery Key</Text>
                <ChevronRightIcon />
              </Pressable>
            </View>
          </View>

          {/* ── Sync & Backup ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>SYNC & BACKUP</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row} onPress={() => router.push('/settings/sync')}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Cloud Sync</Text>
                  <Text style={styles.rowSubLabel}>On · Last synced 2m ago</Text>
                </View>
                {/* Simulated Custom Switch tracking design */}
                <View style={styles.switchTrack}>
                  <View style={styles.switchThumb} />
                </View>
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Sync Now</Text>
                <SyncIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Export Encrypted Backup</Text>
                <DownloadIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Import from Backup</Text>
                <UploadIcon />
              </Pressable>
            </View>
          </View>

          {/* ── App Settings ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>APP SETTINGS</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Auto-Lock Timeout</Text>
                <Text style={styles.rowValue}>5 minutes</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Theme</Text>
                <Text style={styles.rowValue}>Dark</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Default Folder</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Font Size</Text>
                <ChevronRightIcon />
              </Pressable>
            </View>
          </View>

          {/* ── About ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>ABOUT</Text>
            <View style={styles.groupCard}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Version</Text>
                <Text style={styles.rowValue}>1.0.0</Text>
              </View>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Open Source Licenses</Text>
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row} onPress={() => router.push('/trash')}>
                <Text style={styles.rowLabel}>Trash</Text>
                <ChevronRightIcon />
              </Pressable>

              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <Text style={styles.rowLabel}>Contact Support</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Sign Out ── */}
          <View style={styles.signOutSection}>
            <Pressable style={styles.signOutButton}>
              <LogoutIcon />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
            <Pressable style={styles.deleteAccountButton}>
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d14',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // accommodate bottom tab bar
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    color: '#f0f4f8', // textLight
  },
  iconButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textDim,
  },

  /* User Info Card */
  userInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userInfoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 115, 119, 0.2)', // accent-teal/20
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.vaultTeal,
  },
  userInfoRight: {
    flex: 1,
  },
  userInfoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  accountLink: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.vaultTeal,
  },
  vaultCreated: {
    fontSize: 12,
    color: COLORS.textDim,
  },

  /* Sections */
  sectionsContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  sectionGroup: {},
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.footerText, // uppercase subtitle
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  row: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  /* Specialized Row Parts */
  rowTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  rowSubLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 2,
  },
  
  /* Mock Custom Switch */
  switchTrack: {
    width: 40,
    height: 20,
    backgroundColor: COLORS.vaultTeal,
    borderRadius: 10,
    justifyContent: 'center',
  },
  switchThumb: {
    position: 'absolute',
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },

  /* Sign Out Section */
  signOutSection: {
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444', // accent-red
  },
  deleteAccountButton: {
    marginTop: 16,
    padding: 8,
  },
  deleteAccountText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(239, 68, 68, 0.7)', // accent-red/70
  },
});
