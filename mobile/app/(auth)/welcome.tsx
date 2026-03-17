import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
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
import { useAuth } from '../../src/providers/AuthProvider';

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
  const { signIn, signUp, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [loading, setLoading] = useState(false);

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
    shieldScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    shieldOpacity.value = withTiming(1, { duration: 1000 });
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    taglineTranslateY.value = withDelay(500, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    ctaTranslateY.value = withDelay(700, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));
    trustTranslateY.value = withDelay(1000, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    trustOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));

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

  const handleAuthAction = async () => {
    if (!email || !password) return;
    setLoading(true);

    try {
      const { error } = isSigningIn 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        Alert.alert('Authentication Failed', error.message);
      } else {
        // Router will auto-redirect from app/index.tsx based on new auth session
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerSection}>
        <View style={styles.shieldWrapper}>
          <Animated.View style={[styles.pulseRing, pulseStyle]} />
          <Animated.View style={[styles.hexShield, shieldStyle]}>
            <LockIcon />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, titleStyle]}>SecureMemo</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Your notes. Yours alone.</Animated.Text>
      </View>

      {/* Auth Area */}
      <Animated.View style={[styles.actionSection, ctaStyle]}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={handleAuthAction}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.vaultTeal, COLORS.vaultTealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <Text style={styles.primaryButtonText}>{isSigningIn ? 'Sign In' : 'Create Account'}</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setIsSigningIn(!isSigningIn)}
        >
          <Text style={styles.secondaryButtonText}>
            {isSigningIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </Pressable>

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
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  headerSection: {
    alignItems: 'center',
  },
  shieldWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.vaultTeal,
  },
  hexShield: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(13, 115, 119, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  actionSection: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 16,
    color: COLORS.textLight,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: COLORS.vaultTeal,
    fontSize: 14,
    fontWeight: '500',
  },
});
