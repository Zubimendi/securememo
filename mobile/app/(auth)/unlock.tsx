import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { getVaultKey, unlockVault } from '../../src/crypto/vault';
import { useVaultStore } from '../../src/store/vaultStore';
import { useQuery } from '@apollo/client';
import { GET_VAULT_CONFIG } from '../../src/graphql/queries';
import { useAuth } from '../../src/providers/AuthProvider';

// Icons
function FingerprintIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={1.5} strokeLinecap="round">
      <Path d="M12 2C9.5 2 7.2 3 5.5 4.5" />
      <Path d="M19 10C19 6.13 15.87 3 12 3C8.13 3 5 6.13 5 10" />
      <Path d="M8 11C8 8.79 9.79 7 12 7C14.21 7 16 8.79 16 11V14" />
      <Path d="M12 11V17" />
      <Path d="M9 14V17" />
      <Path d="M15 14V17" />
      <Path d="M7 21C7 21 8.5 19 12 19C15.5 19 17 21 17 21" />
    </Svg>
  );
}

function LockKeyIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={1.5}>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 15V18M12 18H10M12 18H14" strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <Path d="M1 1l22 22" />
    </Svg>
  );
}

export default function UnlockScreen() {
  const router = useRouter();
  const { unlock } = useVaultStore();
  const { signOut } = useAuth();

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Fetch vault config from backend
  const { data: configData, loading: configLoading, error: configError } = useQuery(GET_VAULT_CONFIG);

  // Pulse glow animation using RN Animated
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
      ])
    ).start();

    checkBiometrics();
    
    // Automatically trigger biometric unlock if available
    setTimeout(() => {
        if (!showPasswordInput) handleBiometricUnlock();
    }, 500);
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10 / 25, 25 / 25],
  });

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25],
  });

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(compatible && enrolled);
  };

  const handleBiometricUnlock = async () => {
    if (!biometricsAvailable) return;
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SecureMemo',
        fallbackLabel: 'Use Master Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        const key = await getVaultKey();
        if (key) {
          unlock(key, '', '');
          router.replace('/(app)');
        } else {
          setShowPasswordInput(true);
        }
      }
    } catch {
      setShowPasswordInput(true);
    }
  };

  const handlePasswordUnlock = async () => {
    if (!masterPassword.trim() || !configData?.vaultConfig) return;

    setIsUnlocking(true);
    try {
      const { vaultConfig } = configData;
      
      const key = await unlockVault(
        masterPassword,
        vaultConfig.encryptedVaultKey,
        vaultConfig.argon2Salt,
        {
          memory: vaultConfig.argon2Memory,
          iterations: vaultConfig.argon2Iterations,
          parallelism: vaultConfig.argon2Parallelism
        }
      );

      unlock(key, vaultConfig.argon2Salt, '');
      router.replace('/(app)');
    } catch (err: any) {
      console.error('Unlock failed:', err);
      Alert.alert('Unlock Failed', 'Incorrect master password or encryption error.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSignOut = async () => {
      Alert.alert(
          "Sign Out",
          "Are you sure? You'll need to sign back in with your account credentials.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: async () => {
                  await signOut();
                  router.replace('/(auth)/welcome');
              }}
          ]
      )
  }

  if (configLoading) {
      console.log("[Unlock] Loading vault config from backend...");
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={COLORS.vaultTeal} />
              <Text style={{ color: COLORS.textMuted, marginTop: 16 }}>Connecting to vault...</Text>
              <Text style={{ color: COLORS.textDim, fontSize: 10, marginTop: 8 }}>API: {process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
      )
  }

  if (configError) {
      console.error("[Unlock] Backend Connectivity Error:", configError);
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
              <Text style={{ color: COLORS.red, marginBottom: 16, textAlign: 'center' }}>Connection Error</Text>
              <Text style={{ color: COLORS.textDim, textAlign: 'center', marginBottom: 24 }}>
                Unable to reach the SecureMemo backend at {process.env.EXPO_PUBLIC_API_URL}. 
                Please ensure your server is running and your phone is on the same WiFi.
              </Text>
              <Pressable 
                style={styles.unlockButton} 
                onPress={() => router.replace('/')}
              >
                <Text style={styles.unlockButtonText}>Retry Connection</Text>
              </Pressable>
          </View>
      )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Branding Section */}
      <View style={styles.brandingSection}>
        <View style={styles.hexShield}>
          <LockKeyIcon />
        </View>
        <Text style={styles.title}>SecureMemo</Text>
        <Text style={styles.subtitle}>YOUR VAULT IS LOCKED</Text>
      </View>

      {/* Unlock Section */}
      <View style={styles.unlockSection}>
        {!showPasswordInput ? (
          <>
            <View style={styles.biometricContainer}>
              <Animated.View style={[styles.biometricButtonShadow, {
                shadowOpacity: glowOpacity,
                shadowRadius: glowRadius,
              }]}>
                <Pressable
                  style={styles.biometricButton}
                  onPress={handleBiometricUnlock}
                >
                  <FingerprintIcon />
                </Pressable>
              </Animated.View>
            </View>

            <Text style={styles.biometricLabel}>Unlock with Biometrics</Text>

            <Pressable
              style={styles.passwordLink}
              onPress={() => setShowPasswordInput(true)}
            >
              <Text style={styles.passwordLinkText}>Use Master Password</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter master password"
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry={!showPassword}
                value={masterPassword}
                onChangeText={setMasterPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={handlePasswordUnlock}
                returnKeyType="done"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            </View>

            <Pressable
              style={[styles.unlockButton, (!masterPassword.trim() || isUnlocking) && styles.unlockButtonDisabled]}
              onPress={handlePasswordUnlock}
              disabled={!masterPassword.trim() || isUnlocking}
            >
              {isUnlocking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.unlockButtonText}>Decrypt Vault</Text>
              )}
            </Pressable>

            {biometricsAvailable && (
              <Pressable
                style={styles.passwordLink}
                onPress={() => setShowPasswordInput(false)}
              >
                <Text style={styles.passwordLinkText}>Use Biometrics Instead</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <Pressable onPress={() => router.push('/(auth)/recovery-key')}>
          <Text style={styles.footerLink}>Use recovery key instead</Text>
        </Pressable>

        <Pressable onPress={handleSignOut} style={{ marginTop: 12 }}>
          <Text style={styles.signOutLink}>SIGN OUT ACCOUNT</Text>
        </Pressable>

        <View style={styles.lockStatus}>
          <View style={[styles.lockDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.lockStatusText}>AES-256 Protected</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
    justifyContent: 'space-between',
    paddingTop: SPACING['5xl'],
    paddingBottom: SPACING['3xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  brandingSection: {
    alignItems: 'center',
    marginTop: SPACING['5xl'],
  },
  hexShield: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(13,115,119,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    color: COLORS.textLight,
    fontWeight: '400',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  unlockSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  biometricContainer: {
    marginBottom: SPACING['3xl'],
  },
  biometricButtonShadow: {
    borderRadius: 44,
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  biometricButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.vaultTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: SPACING['4xl'],
  },
  passwordLink: {
    paddingVertical: SPACING.sm,
  },
  passwordLinkText: {
    fontSize: 14,
    color: COLORS.vaultTeal,
    fontWeight: '500',
  },
  passwordInputWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  unlockButton: {
    width: '100%',
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.vaultTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  unlockButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  signOutLink: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 2,
    fontWeight: '600',
  },
  lockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  lockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lockStatusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
