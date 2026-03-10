import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

interface NoteCardProps {
  title: string;
  preview: string;
  time: string;
  accentColor?: string;
  onPress?: () => void;
}

export default function NoteCard({
  title,
  preview,
  time,
  accentColor = COLORS.vaultTeal,
  onPress,
}: NoteCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(51,65,85,0.5)',
  },
  accentBar: {
    width: 3,
    height: 48,
    borderRadius: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: '400',
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    paddingTop: 4,
  },
  preview: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
