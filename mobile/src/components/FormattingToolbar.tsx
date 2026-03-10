import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Svg, Path, Line, Rect, Polyline } from 'react-native-svg';
import { COLORS, SPACING } from '../theme';

type FormatAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'h1'
  | 'h2'
  | 'bulletList'
  | 'checklist'
  | 'quote'
  | 'code';

interface FormattingToolbarProps {
  activeFormat?: FormatAction;
  onFormat?: (action: FormatAction) => void;
}

/* ── Inline SVG icons (Material-style, 24×24) ── */

function BoldIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    </Svg>
  );
}

function ItalicIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
    </Svg>
  );
}

function UnderlineIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </Svg>
  );
}

function StrikethroughIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
    </Svg>
  );
}

function H1Icon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M5 4v3h5.5v12h3V7H19V4H5z" />
    </Svg>
  );
}

function H2Icon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M5 4v3h5.5v12h3V7H19V4H5z" />
      <Rect x={16} y={14} width={4} height={2} rx={1} />
    </Svg>
  );
}

function BulletListIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    </Svg>
  );
}

function ChecklistIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z" />
    </Svg>
  );
}

function QuoteIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </Svg>
  );
}

function CodeIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? COLORS.vaultTeal : COLORS.textDim}>
      <Path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </Svg>
  );
}

const BUTTONS: { action: FormatAction; Icon: React.FC<{ active: boolean }>; dividerAfter?: boolean }[] = [
  { action: 'bold', Icon: BoldIcon },
  { action: 'italic', Icon: ItalicIcon },
  { action: 'underline', Icon: UnderlineIcon },
  { action: 'strikethrough', Icon: StrikethroughIcon, dividerAfter: true },
  { action: 'h1', Icon: H1Icon },
  { action: 'h2', Icon: H2Icon },
  { action: 'bulletList', Icon: BulletListIcon },
  { action: 'checklist', Icon: ChecklistIcon },
  { action: 'quote', Icon: QuoteIcon },
  { action: 'code', Icon: CodeIcon },
];

export default function FormattingToolbar({ activeFormat, onFormat }: FormattingToolbarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {BUTTONS.map(({ action, Icon, dividerAfter }) => (
          <React.Fragment key={action}>
            <Pressable
              style={styles.button}
              onPress={() => onFormat?.(action)}
            >
              <Icon active={activeFormat === action} />
            </Pressable>
            {dividerAfter && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
});
