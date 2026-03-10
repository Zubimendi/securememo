import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle, Line, Polyline } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { useNotesStore, Note } from '../../src/store/notesStore';
import NoteCard from '../../src/components/NoteCard';
import FolderChip from '../../src/components/FolderChip';
import { LinearGradient } from 'expo-linear-gradient';

// Icons
function ShieldLockIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.vaultTeal} stroke="none">
      <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={11} cy={11} r={8} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  );
}

function SortIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={4} y1={6} x2={20} y2={6} />
      <Line x1={4} y1={12} x2={16} y2={12} />
      <Line x1={4} y1={18} x2={12} y2={18} />
    </Svg>
  );
}

function PinIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={COLORS.vaultTeal} stroke="none">
      <Path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

// Accent colors for notes
const ACCENT_COLORS = [
  COLORS.vaultTeal,
  '#f59e0b',
  '#f43f5e',
  '#6366f1',
  '#22c55e',
  '#a855f7',
];

// Demo data — in production, this comes from the notesStore
const DEMO_PINNED = [
  { id: '1', title: 'Investment Strategy 2024', time: '2h ago' },
  { id: '2', title: 'Project Phoenix Credentials', time: '5h ago' },
  { id: '3', title: 'Dream Journal', time: 'Yesterday' },
];

const DEMO_NOTES = [
  { id: '4', title: 'Team Sprint Planning', preview: 'Reviewing the Q3 goals and individual contribution metrics for the engineering team...', time: '10:45 AM', color: COLORS.vaultTeal },
  { id: '5', title: 'Monthly Grocery List', preview: 'Organic honey, sourdough starter, almond milk, kale, and those specific Italian beans...', time: '08:20 AM', color: '#f59e0b' },
  { id: '6', title: 'Password Recovery Keys', preview: 'Master key sequences for the backup hardware wallet and cold storage...', time: 'Yesterday', color: '#f43f5e' },
  { id: '7', title: 'Book Summaries: Deep Work', preview: 'Cal Newport discusses the importance of uninterrupted concentration in the digital age...', time: '2 days ago', color: '#6366f1' },
];

const FILTER_CHIPS = ['All Notes', 'Personal', 'Work', 'Finance', 'Ideas'];

export default function HomeScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Notes');
  const [searchQuery, setSearchQuery] = useState('');

  // In production, use the real notes store:
  // const { notes } = useNotesStore();
  // const pinnedNotes = notes.filter(n => n.pinned && !n.deleted);
  // const recentNotes = notes.filter(n => !n.pinned && !n.deleted);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Top Row */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandRow}>
            <ShieldLockIcon />
            <Text style={styles.brandTitle}>SecureMemo</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <SortIcon />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>U</Text>
            </View>
          </View>
        </View>

        {/* Encryption Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDotOuter}>
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.statusText}>VAULT UNLOCKED · AES-256 ACTIVE</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => (
            <FolderChip
              key={chip}
              label={chip}
              active={activeFilter === chip}
              onPress={() => setActiveFilter(chip)}
            />
          ))}
        </ScrollView>

        {/* Pinned Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PINNED</Text>
            <PinIcon />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pinnedRow}
          >
            {DEMO_PINNED.map((note, index) => (
              <Pressable
                key={note.id}
                style={styles.pinnedCard}
                onPress={() => router.push(`/(app)/note/${note.id}`)}
              >
                {/* Subtle glow on first card */}
                {index === 0 && <View style={styles.pinnedGlow} />}
                <Text style={styles.pinnedTitle} numberOfLines={2}>
                  {note.title}
                </Text>
                <Text style={styles.pinnedTime}>Modified {note.time}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recent Notes List */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>RECENT NOTES</Text>
          </View>

          {DEMO_NOTES.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              preview={note.preview}
              time={note.time}
              accentColor={note.color}
              onPress={() => router.push(`/(app)/note/${note.id}`)}
            />
          ))}
        </View>

        {/* Bottom padding for FAB + tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(app)/note/new')}
      >
        <LinearGradient
          colors={[COLORS.vaultTeal, 'rgba(13,115,119,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <PlusIcon />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d14',
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(12,13,20,0.8)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  brandTitle: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    padding: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.tealAlpha20,
    borderWidth: 1,
    borderColor: COLORS.tealAlpha40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.vaultTeal,
    fontSize: 14,
    fontWeight: '600',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(51,65,85,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  statusDotOuter: {
    position: 'relative',
    width: 8,
    height: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: 0.8,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 48,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 14,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {},

  // Filter Chips
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },

  // Sections
  section: {
    marginBottom: SPACING['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeaderSimple: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Pinned Cards
  pinnedRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  pinnedCard: {
    width: 160,
    height: 140,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pinnedGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(13,115,119,0.05)',
  },
  pinnedTitle: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: '400',
    lineHeight: 24,
  },
  pinnedTime: {
    fontSize: 10,
    color: '#64748b',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
