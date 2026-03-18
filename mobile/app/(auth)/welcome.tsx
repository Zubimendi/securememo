import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
  Easing,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle } from 'react-native-svg';
import SecurityBadge from '../../src/components/SecurityBadge';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/providers/AuthProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function LockIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 256 256" fill={COLORS.vaultTeal}>
      <Path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84v28a8,8,0,0,1-16,0V164a20,20,0,1,1,16,0ZM160,80H96V56a32,32,0,0,1,64,0Z" />
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

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [loading, setLoading] = useState(false);

  // Animation values using RN Animated
  const shieldScale = useRef(new Animated.Value(0.9)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(20)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const trustTranslateY = useRef(new Animated.Value(20)).current;
  const trustOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.8)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Shield entrance
    Animated.parallel([
      Animated.timing(shieldScale, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(shieldOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    // Title entrance
    Animated.parallel([
      Animated.timing(titleTranslateY, { toValue: 0, duration: 800, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
    ]).start();

    // Tagline entrance
    Animated.parallel([
      Animated.timing(taglineTranslateY, { toValue: 0, duration: 800, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 800, delay: 500, useNativeDriver: true }),
    ]).start();

    // CTA entrance
    Animated.parallel([
      Animated.timing(ctaTranslateY, { toValue: 0, duration: 800, delay: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 800, delay: 700, useNativeDriver: true }),
    ]).start();

    // Trust entrance
    Animated.parallel([
      Animated.timing(trustTranslateY, { toValue: 0, duration: 800, delay: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(trustOpacity, { toValue: 1, duration: 800, delay: 1000, useNativeDriver: true }),
    ]).start();

    // Pulse loop
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1.8, duration: 3000, easing: Easing.bezier(0.455, 0.03, 0.515, 0.955), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 3000, easing: Easing.bezier(0.455, 0.03, 0.515, 0.955), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const handleAuthAction = async () => {
    if (!email || !password) return;
    setLoading(true);
    setSignUpSuccess(false);
    console.log(`[Auth] Attempting ${isSigningIn ? 'Sign In' : 'Sign Up'} for ${email}`);

    try {
      const { error } = isSigningIn 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        console.error(`[Auth] Error:`, error.message);
        Alert.alert('Authentication Failed', error.message);
      } else if (!isSigningIn) {
        console.log(`[Auth] Sign Up successful`);
        setSignUpSuccess(true);
        Alert.alert(
          'Account Created',
          'Please check your email for a confirmation link to activate your account.',
          [{ text: 'OK' }]
        );
      } else {
        console.log(`[Auth] Sign In successful, waiting for session redirect...`);
      }
    } catch (e) {
      console.error(`[Auth] Unexpected Error:`, e);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Content */}
        <View style={styles.headerSection}>
          <View style={styles.shieldWrapper}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
            <Animated.View style={[styles.hexShield, { transform: [{ scale: shieldScale }], opacity: shieldOpacity }]}>
              <LockIcon />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.title, { transform: [{ translateY: titleTranslateY }], opacity: titleOpacity }]}>SecureMemo</Animated.Text>
          <Animated.Text style={[styles.tagline, { transform: [{ translateY: taglineTranslateY }], opacity: taglineOpacity }]}>Your notes. Yours alone.</Animated.Text>
        </View>

        {/* Auth Area */}
        <Animated.View style={[styles.actionSection, { transform: [{ translateY: ctaTranslateY }], opacity: ctaOpacity }]}>
          {signUpSuccess && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>Account created! Check your email to confirm.</Text>
            </View>
          )}

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
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            </View>
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
            onPress={() => {
              setIsSigningIn(!isSigningIn);
              setSignUpSuccess(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {isSigningIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </Pressable>

          <Animated.View style={{ transform: [{ translateY: trustTranslateY }], opacity: trustOpacity }}>
            <SecurityBadge />
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 48,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
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
  successMessage: {
    width: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    marginBottom: 8,
  },
  successText: {
    color: '#4ade80',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
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
