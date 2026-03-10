import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Svg, Path, Line, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';

/* ── Icons ── */

function CloseIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  );
}

function PremiumBadgeIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={6} />
      <Path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </Svg>
  );
}

function CheckCircleIcon({ color = '#d97706' }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
  );
}

function BlockIcon({ color = '#475569' }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Line x1={4.93} y1={4.93} x2={19.07} y2={19.07} />
    </Svg>
  );
}

export default function ProScreen() {
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <View style={styles.container}>
      {/* ── Top Navigation ── */}
      <View style={styles.topNav}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <CloseIcon />
        </Pressable>
        <View style={styles.topNavRight}>
          <LinearGradient
            colors={['#b45309', '#d97706']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.proBadge}
          >
            <PremiumBadgeIcon />
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Section ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SecureMemo Pro</Text>
          <Text style={styles.headerSubtitle}>For those who take privacy seriously.</Text>
        </View>

        {/* ── Pricing Toggle ── */}
        <View style={styles.toggleContainerWrapper}>
          <View style={styles.toggleContainer}>
            <Pressable
              style={[styles.toggleOption, billing === 'monthly' && styles.toggleOptionActive]}
              onPress={() => setBilling('monthly')}
            >
              <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleOption, billing === 'annual' && styles.toggleOptionActive]}
              onPress={() => setBilling('annual')}
            >
              <View style={styles.annualToggleInner}>
                <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextActive]}>
                  Annual
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 40%</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ── Main Pricing Card ── */}
        <View style={styles.pricingCardWrapper}>
          <View style={styles.pricingCard}>
            {/* Glow / blur effect background decoration (simulated via positioned gradient) */}
            <LinearGradient
              colors={['rgba(217, 119, 6, 0.1)', 'transparent']}
              style={styles.cardGlowDecor}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            <View style={styles.pricingCardHeader}>
              <Text style={styles.priceAmount}>
                {billing === 'annual' ? '₦4,999' : '₦500'}
              </Text>
              <Text style={styles.priceBilledText}>
                {billing === 'annual' ? 'billed annually ($2.99/mo)' : 'billed monthly'}
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <CheckCircleIcon />
                <Text style={styles.featureText}>Unlimited encrypted notes</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircleIcon />
                <Text style={styles.featureText}>Cross-platform cloud sync</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircleIcon />
                <Text style={styles.featureText}>24/7 Priority support</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircleIcon />
                <Text style={styles.featureText}>Early access to new features</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircleIcon />
                <Text style={styles.featureText}>Up to 50MB attachments</Text>
              </View>
            </View>

            <Pressable style={styles.ctaButtonWrapper}>
              <LinearGradient
                colors={['#b45309', '#d97706']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
              </LinearGradient>
            </Pressable>
            <Text style={styles.cancelAnytime}>Cancel anytime. No questions asked.</Text>
          </View>
        </View>

        {/* ── Comparison Table ── */}
        <View style={styles.comparisonSection}>
          <Text style={styles.compareTitle}>Compare Plans</Text>
          <View style={styles.tableContainer}>
            {/* Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColFeature, styles.tableHeaderLabel]}>FEATURE</Text>
              <Text style={[styles.tableColFree, styles.tableHeaderLabel]}>FREE</Text>
              <Text style={[styles.tableColPro, styles.tableHeaderLabelPro]}>PRO</Text>
            </View>
            
            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableColFeature}>Notes Limit</Text>
              <Text style={styles.tableColFree}>20</Text>
              <Text style={styles.tableColPro}>Unlimited</Text>
            </View>

            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableColFeature}>Cloud Sync</Text>
              <View style={styles.tableColFreeWrapper}>
                <BlockIcon />
              </View>
              <View style={styles.tableColProWrapper}>
                <CheckCircleIcon />
              </View>
            </View>

            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableColFeature}>Devices</Text>
              <Text style={styles.tableColFree}>1</Text>
              <Text style={styles.tableColPro}>Unlimited</Text>
            </View>

            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableColFeature}>Support</Text>
              <Text style={styles.tableColFree}>Standard</Text>
              <Text style={styles.tableColPro}>Priority</Text>
            </View>

            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableColFeature}>Attachments</Text>
              <Text style={styles.tableColFree}>2MB</Text>
              <Text style={styles.tableColPro}>50MB</Text>
            </View>
          </View>
        </View>

        {/* ── Trust Text ── */}
        <Text style={styles.trustText}>
          Your payment is processed by Google Play. SecureMemo never sees your payment details.
        </Text>

      </ScrollView>

      {/* ── Footer Links ── */}
      <View style={styles.footer}>
        <Pressable>
          <Text style={styles.footerLink}>Restore Purchase</Text>
        </Pressable>
        <View style={styles.footerDot} />
        <Pressable>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f', // background-dark matching exactly
  },
  
  /* Top Nav */
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 16,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topNavRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    // Emulating shadow
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  /* Header */
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    color: '#f0f4f8',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 240,
  },

  /* Toggle */
  toggleContainerWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900/50
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#1e293b', // slate-800
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  toggleOptionActive: {
    backgroundColor: '#1e293b', // slate-800 active
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  toggleTextActive: {
    color: '#fff',
  },
  annualToggleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)', // primary/20
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },

  /* Main Pricing Card */
  pricingCardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 48,
    alignItems: 'center',
  },
  pricingCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111827',
    borderRadius: 24, // 3xl
    paddingHorizontal: 32,
    paddingVertical: 32,
    borderWidth: 1.5,
    borderColor: '#d97706',
    position: 'relative',
    overflow: 'hidden',
    // Ember Glow shadow
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGlowDecor: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  pricingCardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceAmount: {
    fontSize: 48,
    color: '#f0f4f8',
    marginBottom: 8,
    includeFontPadding: false,
    lineHeight: 48,
  },
  priceBilledText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  featuresList: {
    gap: 16,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0', // slate-200
  },
  ctaButtonWrapper: {
    width: '100%',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelAnytime: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },

  /* Comparison Section */
  comparisonSection: {
    paddingHorizontal: 24,
    marginBottom: 64,
    alignItems: 'center',
  },
  compareTitle: {
    fontSize: 20,
    color: '#f0f4f8',
    marginBottom: 24,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // slate-900/40
    borderRadius: 16, // 2xl
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tableHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableHeaderLabelPro: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706', // primary Pro label
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tableDivider: {
    height: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
  },
  
  // Columns for the table
  tableColFeature: {
    flex: 2,
    fontSize: 14,
    color: '#cbd5e1', // slate-300
  },
  tableColFree: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b', // slate-500
  },
  tableColFreeWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tableColPro: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9', // slate-100
  },
  tableColProWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  /* Trust Text */
  trustText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 18,
    paddingHorizontal: 32,
    marginBottom: 32,
  },

  /* Footer Links */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    paddingBottom: 4,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155', // slate-700
  },
});
