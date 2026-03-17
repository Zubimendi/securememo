import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Svg, Path, Polyline, Line, Rect, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/theme';
import { useAuth } from '../../../src/providers/AuthProvider';
import { useVaultStore } from '../../../src/store/vaultStore';
import { GET_ME } from '../../../src/graphql/queries';

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
  const { signOut, user } = useAuth();
  const { lock } = useVaultStore();

  const { data, loading, refetch } = useQuery(GET_ME);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "This will lock your vault and clear keys from memory. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            await lock();
            await signOut();
            router.replace('/(auth)/welcome');
          } 
        }
      ]
    );
  }, [signOut, lock, router]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={COLORS.vaultTeal} size="large" />
      </View>
    );
  }

  const me = data?.me;

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
          <Text style={styles.subtitle}>
            {me?.noteCount || 0} notes secured in vault
          </Text>
        </View>

        {/* ── User Info Card ── */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {me?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfoRight}>
              <View style={styles.userInfoTopRow}>
                <Text style={styles.userEmail} numberOfLines={1}>{me?.email}</Text>
                <Pressable>
                  <Text style={styles.accountLink}>Account →</Text>
                </Pressable>
              </View>
              <Text style={styles.vaultCreated}>
                Connected since {me?.vaultConfig?.createdAt ? new Date(me.vaultConfig.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionsContainer}>
          {/* ── Vault Security ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>VAULT SECURITY</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row}>
                <ShieldIcon />
                <Text style={styles.rowLabel}>Privacy & Biometrics</Text>
                <ChevronRightIcon />
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable style={styles.row}>
                <KeyIcon />
                <Text style={styles.rowLabel}>Update Master Password</Text>
                <ChevronRightIcon />
              </Pressable>
            </View>
          </View>

          {/* ── Sync & Backup ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>SYNC & BACKUP</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row} onPress={() => refetch()}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Cloud Synchronization</Text>
                  <Text style={styles.rowSubLabel}>E2EE Sync Active</Text>
                </View>
                <SyncIcon />
              </Pressable>
            </View>
          </View>

          {/* ── About ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>ABOUT SECUREMEMO</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.row} onPress={() => router.push('/(app)/trash')}>
                <Text style={styles.rowLabel}>Trash</Text>
                <ChevronRightIcon />
              </Pressable>
-             <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>App Version</Text>
                <Text style={styles.rowValue}>1.0.0-PRO</Text>
              </View>
            </View>
          </View>

          {/* ── Sign Out ── */}
          <View style={styles.signOutSection}>
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <LogoutIcon />
              <Text style={styles.signOutText}>Secure Sign Out</Text>
            </Pressable>
            <Text style={styles.disclaimerText}>
              Signing out will wipe all session keys. You will need your master password to re-unlock the vault.
            </Text>
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    color: '#f0f4f8',
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  userInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userInfoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.5)',
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
    backgroundColor: 'rgba(13, 115, 119, 0.2)',
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
    maxWidth: '70%',
  },
  accountLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.vaultTeal,
  },
  vaultCreated: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    gap: 24,
    marginTop: 8,
  },
  sectionGroup: {},
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748b',
    paddingHorizontal: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.4)',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  row: {
    height: 56,
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
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(51,65,85,0.3)',
  },
  rowTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  rowSubLabel: {
    fontSize: 11,
    color: COLORS.vaultTeal,
    marginTop: 2,
    fontWeight: '500',
  },
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
    height: 56,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
