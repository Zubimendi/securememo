import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Circle } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { getVaultKey, isVaultSetup } from '../../src/crypto/vault';
import { useVaultStore } from '../../src/store/vaultStore';

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

export default function UnlockScreen() {
  const router = useRouter();
  const { unlock } = useVaultStore();

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockedAgo, setLockedAgo] = useState('just now');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Pulse glow animation
  const glowIntensity = useSharedValue(10);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
        withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      false
    );

    // Check biometrics availability
    checkBiometrics();
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value / 25,
    shadowRadius: glowIntensity.value,
  }));

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(compatible && enrolled);
  };

  const handleBiometricUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SecureMemo',
        fallbackLabel: 'Use Master Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const vaultKey = await getVaultKey();
        if (vaultKey) {
          unlock(vaultKey, '', '');
          router.replace('/(app)');
        } else {
          Alert.alert('Session Expired', 'Please sign in with your master password.');
          setShowPasswordInput(true);
        }
      }
    } catch {
      Alert.alert('Biometric Error', 'Unable to authenticate. Please use your master password.');
      setShowPasswordInput(true);
    }
  };

  const handlePasswordUnlock = async () => {
    if (!masterPassword.trim()) return;

    setIsLoading(true);
    try {
      // In production, fetch encryptedVaultKey + argon2 params from backend
      // For now, try to get the vault key from secure store
      const vaultKey = await getVaultKey();
      if (vaultKey) {
        unlock(vaultKey, '', '');
        router.replace('/(app)');
      } else {
        Alert.alert('Unlock Failed', 'Invalid master password or session expired.');
      }
    } catch {
      Alert.alert('Unlock Failed', 'Could not unlock vault. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Branding Section */}
      <View style={styles.brandingSection}>
        {/* Hexagonal Shield */}
        <View style={styles.hexShield}>
          <LockKeyIcon />
        </View>

        <Text style={styles.title}>SecureMemo</Text>
        <Text style={styles.subtitle}>YOUR VAULT</Text>
      </View>

      {/* Unlock Section */}
      <View style={styles.unlockSection}>
        {!showPasswordInput ? (
          <>
            {/* Biometric Button */}
            <View style={styles.biometricContainer}>
              <Animated.View style={[styles.biometricButtonShadow, glowStyle]}>
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
            {/* Master Password Input */}
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter master password"
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry
                value={masterPassword}
                onChangeText={setMasterPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={handlePasswordUnlock}
                returnKeyType="done"
              />
            </View>

            <Pressable
              style={[styles.unlockButton, !masterPassword.trim() && styles.unlockButtonDisabled]}
              onPress={handlePasswordUnlock}
              disabled={!masterPassword.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.unlockButtonText}>Unlock</Text>
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
        <Pressable>
          <Text style={styles.footerLink}>Use recovery key instead</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.signOutLink}>SIGN OUT</Text>
        </Pressable>

        {/* Lock Status */}
        <View style={styles.lockStatus}>
          <View style={styles.lockDot} />
          <Text style={styles.lockStatusText}>Locked {lockedAgo}</Text>
        </View>
      </View>
    </View>
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
  // Branding
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
    fontSize: 14,
    color: COLORS.footerText,
    fontWeight: '500',
    letterSpacing: 2,
  },

  // Unlock
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
    backgroundColor: COLORS.whiteAlpha5,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha10,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  passwordInput: {
    color: COLORS.textLight,
    fontSize: 16,
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
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footerSection: {
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  signOutLink: {
    fontSize: 12,
    color: COLORS.darkGray,
    letterSpacing: 2,
  },
  lockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(127,29,29,0.5)',
  },
  lockStatusText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});
