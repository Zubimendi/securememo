import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@apollo/client';
import { Svg, Path, Circle, Line } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { useNotesStore } from '../../src/store/notesStore';
import { useVaultStore } from '../../src/store/vaultStore';
import NoteCard from '../../src/components/NoteCard';
import FolderChip from '../../src/components/FolderChip';
import { LinearGradient } from 'expo-linear-gradient';
import { GET_NOTES } from '../../src/graphql/queries';

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
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
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

const FILTER_CHIPS = ['All Notes', 'Personal', 'Work', 'Finance', 'Ideas'];

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ folder?: string }>();
  const [activeFilter, setActiveFilter] = useState<string>(params.folder || 'All Notes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (params.folder) {
      setActiveFilter(params.folder);
    }
  }, [params.folder]);
  
  const { notes, loadNotes, isLoading: storeLoading } = useNotesStore();
  const { vaultKey, isUnlocked } = useVaultStore();

  const { data, loading, error, refetch } = useQuery(GET_NOTES, {
    variables: { limit: 100 },
    skip: !vaultKey || !isUnlocked,
    fetchPolicy: 'network-only',
  });

  const onRefresh = useCallback(async () => {
    if (refetch) await refetch();
  }, [refetch]);

  useEffect(() => {
    if (data?.notes && vaultKey) {
      loadNotes(data.notes, vaultKey);
    }
  }, [data, vaultKey]);

  // Derived filter state
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (n.deleted) return false;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter !== 'All Notes') return n.folder?.toUpperCase() === activeFilter.toUpperCase();
      return true;
    });
  }, [notes, searchQuery, activeFilter]);

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const recentNotes = filteredNotes.filter(n => !n.pinned);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

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
            <Pressable 
              style={styles.avatar}
              onPress={() => router.push('/(app)/settings')}
            >
              <Text style={styles.avatarText}>U</Text>
            </Pressable>
          </View>
        </View>

        {/* Encryption Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDotOuter}>
            <View style={[styles.statusDot, { backgroundColor: isUnlocked ? '#22c55e' : '#ef4444' }]} />
          </View>
          <Text style={styles.statusText}>
            {isUnlocked ? 'VAULT UNLOCKED · AES-256 ACTIVE' : 'VAULT LOCKED'}
          </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={COLORS.vaultTeal}
          />
        }
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

        {loading && notes.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.vaultTeal} size="large" />
            <Text style={{ color: '#94a3b8', marginTop: 12 }}>Unlocking your vault...</Text>
          </View>
        ) : (
          <>
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
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
                  {pinnedNotes.map((note, index) => (
                    <Pressable
                      key={note.id}
                      style={styles.pinnedCard}
                      onPress={() => router.push(`/(app)/note/${note.id}`)}
                    >
                      {index === 0 && <View style={styles.pinnedGlow} />}
                      <Text style={styles.pinnedTitle} numberOfLines={2}>
                        {note.title || 'Untitled'}
                      </Text>
                      <Text style={styles.pinnedTime}>Modified {formatTime(note.updatedAt)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recent Notes List */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderSimple}>
                <Text style={styles.sectionTitle}>
                  {activeFilter === 'All Notes' ? 'RECENT NOTES' : activeFilter.toUpperCase()}
                </Text>
              </View>

              {recentNotes.length === 0 && !loading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#64748b' }}>No notes found.</Text>
                </View>
              )}

              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  title={note.title || 'Untitled'}
                  preview={note.content.substring(0, 80).replace(/\n/g, ' ')}
                  time={formatTime(note.updatedAt)}
                  accentColor={COLORS.vaultTeal}
                  onPress={() => router.push(`/(app)/note/${note.id}`)}
                />
              ))}
            </View>
          </>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
