import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { COLORS, SPACING } from '../theme';

interface EncryptionStatusBarProps {
  saved?: boolean;
  label?: string;
}

function CheckCircleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.green} stroke="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
  );
}

export default function EncryptionStatusBar({
  saved = true,
  label,
}: EncryptionStatusBarProps) {
  const statusLabel = label ?? (saved ? '🔐 Encrypted on device · Changes saved' : '🔐 Encrypting...');

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusLabel}</Text>
      {saved && <CheckCircleIcon />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.encryptionBg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 11,
    color: COLORS.green,
  },
});
