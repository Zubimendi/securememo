import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../theme';

const BADGES = [
  { emoji: '🔒', label: 'Zero-Knowledge' },
  { emoji: '🔑', label: 'AES-256' },
  { emoji: '📱', label: 'Offline First' },
];

export default function SecurityBadge() {
  return (
    <View style={styles.container}>
      {BADGES.map((badge, index) => (
        <React.Fragment key={badge.label}>
          <View style={styles.badge}>
            <Text style={styles.emoji}>{badge.emoji}</Text>
            <Text style={styles.label}>{badge.label}</Text>
          </View>
          {index < BADGES.length - 1 && <View style={styles.dot} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 11,
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    color: COLORS.footerText,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
});
