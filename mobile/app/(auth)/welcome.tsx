import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import SecurityBadge from '../../src/components/SecurityBadge';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Pressable for Reanimated compatibility
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LockIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 256 256" fill={COLORS.vaultTeal}>
      <Path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84v28a8,8,0,0,1-16,0V164a20,20,0,1,1,16,0ZM160,80H96V56a32,32,0,0,1,64,0Z" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const shieldScale = useSharedValue(0.9);
  const shieldOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);
  const trustTranslateY = useSharedValue(20);
  const trustOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(0.8);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Shield fade-in-scale
    shieldScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    shieldOpacity.value = withTiming(1, { duration: 1000 });

    // Title fade-in-up
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Tagline fade-in-up
    taglineTranslateY.value = withDelay(500, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));

    // CTA fade-in-up
    ctaTranslateY.value = withDelay(700, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));

    // Trust badges fade-in-up
    trustTranslateY.value = withDelay(1000, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    trustOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));

    // Pulse ring animation — repeating
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(1.8, { duration: 3000, easing: Easing.bezier(0.455, 0.03, 0.515, 0.955) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 0 }),
        withTiming(0, { duration: 3000, easing: Easing.bezier(0.455, 0.03, 0.515, 0.955) })
      ),
      -1,
      false
    );
  }, []);

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
    opacity: shieldOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineTranslateY.value }],
    opacity: taglineOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ctaTranslateY.value }],
    opacity: ctaOpacity.value,
  }));

  const trustStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: trustTranslateY.value }],
    opacity: trustOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerSection}>
        {/* Shield Icon with Pulse */}
        <View style={styles.shieldWrapper}>
          {/* Pulse Ring */}
          <Animated.View style={[styles.pulseRing, pulseStyle]} />

          {/* Hexagonal Shield */}
          <Animated.View style={[styles.hexShield, shieldStyle]}>
            <LockIcon />
          </Animated.View>
        </View>

        {/* App Identity */}
        <Animated.Text style={[styles.title, titleStyle]}>
          SecureMemo
        </Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Your notes. Yours alone.
        </Animated.Text>
      </View>

      {/* Action Area */}
      <Animated.View style={[styles.actionSection, ctaStyle]}>
        {/* Primary Button — Create Vault */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/create-vault')}
        >
          <LinearGradient
            colors={[COLORS.vaultTeal, COLORS.vaultTealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Create Vault</Text>
          </LinearGradient>
        </Pressable>

        {/* Secondary Button — Already have a vault */}
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/unlock')}
        >
          <Text style={styles.secondaryButtonText}>I already have a vault</Text>
        </Pressable>

        {/* Trust Indicators */}
        <Animated.View style={trustStyle}>
          <SecurityBadge />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: SPACING['5xl'],
    paddingHorizontal: SPACING['3xl'],
  },
  headerSection: {
    alignItems: 'center',
  },
  shieldWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['4xl'],
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: COLORS.vaultTeal,
  },
  hexShield: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.vaultBlack,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    // Hexagonal shape approximation using border radius
    borderRadius: 20,
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    color: COLORS.textLight,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textDim,
    marginTop: SPACING.md,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    fontWeight: '400',
  },
  actionSection: {
    width: '100%',
    gap: SPACING.lg,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xl,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
});
