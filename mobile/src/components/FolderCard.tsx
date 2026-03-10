import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

interface FolderCardProps {
  name: string;
  noteCount: number;
  accentColor: string;
  icon?: 'folder' | 'star' | 'favorite' | 'lock' | 'archive';
  lastEdited?: string;
  dimmed?: boolean;
  onPress?: () => void;
}

/* ── Icon SVGs ── */

function FolderIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </Svg>
  );
}

function HeartIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </Svg>
  );
}

function ArchiveIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
    </Svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ color: string }>> = {
  folder: FolderIcon,
  star: StarIcon,
  favorite: HeartIcon,
  lock: LockIcon,
  archive: ArchiveIcon,
};

export default function FolderCard({
  name,
  noteCount,
  accentColor,
  icon = 'folder',
  lastEdited,
  dimmed = false,
  onPress,
}: FolderCardProps) {
  const IconComponent = ICON_MAP[icon] ?? FolderIcon;

  return (
    <Pressable
      style={[styles.card, dimmed && styles.dimmed]}
      onPress={onPress}
    >
      {/* Top Row: dot + icon */}
      <View style={styles.topRow}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <IconComponent color={accentColor} />
      </View>

      {/* Bottom */}
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{noteCount} notes</Text>
      </View>

      {/* Timestamp */}
      {lastEdited !== undefined && (
        <Text style={styles.timestamp}>{lastEdited}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    height: 120,
    justifyContent: 'space-between',
  },
  dimmed: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  count: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
  },
  timestamp: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 11,
    color: COLORS.darkGray,
  },
});
