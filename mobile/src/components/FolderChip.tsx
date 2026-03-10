import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

interface FolderChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export default function FolderChip({ label, active = false, onPress }: FolderChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.vaultTeal,
    borderColor: COLORS.vaultTeal,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
