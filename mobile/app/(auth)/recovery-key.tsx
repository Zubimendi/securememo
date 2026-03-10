import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

// Icons
function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
    </Svg>
  );
}

function CopyIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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

function ShieldIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.darkGray}>
      <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </Svg>
  );
}

export default function RecoveryKeyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recoveryPhrase: string }>();

  const [isRevealed, setIsRevealed] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const words = useMemo(() => {
    const phrase = params.recoveryPhrase || '';
    return phrase.split(' ').filter(Boolean);
  }, [params.recoveryPhrase]);

  const handleCopyAll = async () => {
    if (params.recoveryPhrase) {
      await Clipboard.setStringAsync(params.recoveryPhrase);
      Alert.alert('Copied', 'Recovery key copied to clipboard. Paste it somewhere safe and clear your clipboard.');
    }
  };

  const handleContinue = () => {
    // Navigate to the main app
    router.replace('/(app)');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>VAULT SECURITY</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <WarningIcon />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Write this down right now.</Text>
          <Text style={styles.warningDescription}>
            These 16 words are the <Text style={{ fontWeight: '700' }}>ONLY</Text> way to recover your vault if you forget your master password. We cannot recover them.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recovery Phrase Card */}
        <View style={styles.phraseCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderLabel}>YOUR RECOVERY KEY</Text>
            <View style={styles.cardHeaderActions}>
              <Pressable style={styles.actionButton} onPress={handleCopyAll}>
                <CopyIcon />
                <Text style={styles.actionButtonText}>Copy All</Text>
              </Pressable>
            </View>
          </View>

          {/* Word Grid */}
          <View style={styles.wordGrid}>
            {words.map((word, index) => (
              <View key={index} style={styles.wordCell}>
                <Text style={styles.wordNumber}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}

            {/* Blur Overlay */}
            {!isRevealed && (
              <Pressable
                style={styles.blurOverlay}
                onPress={() => setIsRevealed(true)}
              >
                <EyeOffIcon />
                <Text style={styles.revealText}>Tap to reveal</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Confirmation Checkbox */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setIsConfirmed(!isConfirmed)}
        >
          <View style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}>
            {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have written down my recovery key and stored it safely in a physical location.
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, !isConfirmed && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isConfirmed}
        >
          <LinearGradient
            colors={isConfirmed
              ? [COLORS.vaultTeal, COLORS.vaultTealDark]
              : [COLORS.darkGray, COLORS.darkGray]
            }
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>I've saved my recovery key</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.securityNote}>
          <ShieldIcon />
          <Text style={styles.securityNoteText}>
            SecureMemo never transmits your recovery key. It exists only on your device.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(51,65,85,0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 2,
  },
  warningBanner: {
    backgroundColor: COLORS.amberBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    gap: SPACING.lg,
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 20,
    color: COLORS.amber,
    fontWeight: '400',
  },
  warningDescription: {
    fontSize: 13,
    color: COLORS.amberDark,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING['2xl'],
  },
  phraseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING['2xl'],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  cardHeaderLabel: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.vaultTeal,
    fontWeight: '500',
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    position: 'relative',
  },
  wordCell: {
    width: '47%',
    backgroundColor: COLORS.vaultGlow,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.3)',
  },
  wordNumber: {
    fontSize: 11,
    color: COLORS.footerText,
    marginBottom: 4,
  },
  wordText: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.85)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  revealText: {
    fontSize: 14,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(51,65,85,1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: COLORS.vaultTeal,
    backgroundColor: COLORS.vaultTeal,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
    paddingTop: SPACING.lg,
    gap: SPACING['2xl'],
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    opacity: 0.6,
  },
  securityNoteText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
