import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../theme';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export interface StrengthResult {
  score: number;       // 0–4
  label: string;
  color: string;
  isValid: boolean;    // score >= 3
  requirements: Requirement[];
}

export function evaluatePassword(password: string): StrengthResult {
  const requirements: Requirement[] = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Numbers', met: /[0-9]/.test(password) },
    { label: 'Special symbol', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter((r) => r.met).length;

  const labels: Record<number, string> = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong Password',
  };

  const colors: Record<number, string> = {
    0: COLORS.darkGray,
    1: COLORS.red,
    2: COLORS.amber,
    3: COLORS.green,
    4: COLORS.green,
  };

  return {
    score,
    label: labels[score],
    color: colors[score],
    isValid: score >= 3,
    requirements,
  };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => evaluatePassword(password), [password]);

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength Bar Segments */}
      <View style={styles.barRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: i < strength.score ? strength.color : COLORS.darkGray },
            ]}
          />
        ))}
      </View>

      {/* Strength Label */}
      <Text style={[styles.label, { color: strength.color }]}>
        {strength.label}
      </Text>

      {/* Requirements Checklist */}
      <View style={styles.requirementsGrid}>
        {strength.requirements.map((req) => (
          <View key={req.label} style={styles.requirementRow}>
            <Text style={[styles.checkIcon, { color: req.met ? COLORS.green : COLORS.darkGray }]}>
              {req.met ? '✓' : '○'}
            </Text>
            <Text style={styles.requirementLabel}>{req.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.sm,
  },
  barRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: SPACING.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    marginBottom: SPACING.sm,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  requirementLabel: {
    fontSize: 12,
    color: COLORS.textDim,
  },
});
