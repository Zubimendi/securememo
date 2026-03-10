import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle } from 'react-native-svg';
import PasswordStrength, { evaluatePassword } from '../../src/components/PasswordStrength';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { createVault } from '../../src/crypto/vault';
import { LinearGradient } from 'expo-linear-gradient';

// Icons
function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
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

function WarningIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.amber}>
      <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </Svg>
  );
}

export default function CreateVaultScreen() {
  const router = useRouter();

  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = evaluatePassword(masterPassword);
  const passwordsMatch = masterPassword === confirmPassword && confirmPassword.length > 0;
  const canContinue = strength.isValid && passwordsMatch && !isLoading;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsLoading(true);
    try {
      const result = await createVault(masterPassword);

      // Navigate to recovery key screen with the phrase
      router.push({
        pathname: '/(auth)/recovery-key',
        params: { recoveryPhrase: result.recoveryPhrase },
      });
    } catch (error) {
      Alert.alert(
        'Vault Creation Failed',
        'An error occurred while creating your vault. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <BackIcon />
          </Pressable>
          <Text style={styles.stepIndicator}>1 of 3</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.heading}>Create Your Vault</Text>
          <Text style={styles.description}>
            Choose a strong master password. It cannot be recovered if forgotten — only your recovery key can help.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Master Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>MASTER PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your master password"
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry={!showPassword}
                value={masterPassword}
                onChangeText={setMasterPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            </View>

            {/* Password Strength Indicator */}
            <PasswordStrength password={masterPassword} />
          </View>

          {/* Confirm Password */}
          <View style={[styles.fieldGroup, { paddingTop: SPACING.sm }]}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={styles.mismatchText}>Passwords do not match</Text>
            )}
          </View>

          {/* Warning Card */}
          <View style={styles.warningCard}>
            <WarningIcon />
            <Text style={styles.warningText}>
              SecureMemo cannot reset your master password. If you lose it, your notes will be permanently inaccessible without your recovery key.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={canContinue
              ? [COLORS.vaultTeal, COLORS.vaultTealDark]
              : [COLORS.darkGray, COLORS.darkGray]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={styles.footerNote}>
          Protected by 256-bit AES Encryption
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  titleSection: {
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING.lg,
  },
  heading: {
    fontSize: 28,
    color: COLORS.textLight,
    fontWeight: '400',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: 'rgba(240,244,248,0.6)',
    lineHeight: 22,
  },
  formSection: {
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['3xl'],
    gap: SPACING['2xl'],
  },
  fieldGroup: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: 13,
    color: 'rgba(240,244,248,0.5)',
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteAlpha5,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha10,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  eyeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  mismatchText: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  warningCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha10,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(240,244,248,0.7)',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
    paddingTop: SPACING.lg,
    gap: SPACING.lg,
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: 'rgba(100,116,139,0.6)',
    textAlign: 'center',
  },
});
