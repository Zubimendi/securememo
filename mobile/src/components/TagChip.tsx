import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../theme';

interface TagChipProps {
  label: string;
  onPress?: () => void;
  onRemove?: () => void;
}

export default function TagChip({ label, onPress }: TagChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.encryptionBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    color: COLORS.textDim,
  },
});
