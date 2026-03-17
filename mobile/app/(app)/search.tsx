import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Svg, Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import { Note, useNotesStore } from '../../src/store/notesStore';

/* ── Icons ── */

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={11} cy={11} r={8} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={COLORS.vaultTeal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <Path d="M7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={3} y1={10} x2={21} y2={10} />
    </Svg>
  );
}

const FILTER_CHIPS = ['All', 'Titles', 'Content', 'Tags'];

export default function SearchScreen() {
  const router = useRouter();
  const { notes } = useNotesStore();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => {
      // Don't show deleted notes in search
      if (note.deleted) return false;

      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const contentMatch = note.content.toLowerCase().includes(lowerQuery);
      const tagMatch = note.tags.some(t => t.toLowerCase().includes(lowerQuery));

      if (activeFilter === 'Titles') return titleMatch;
      if (activeFilter === 'Content') return contentMatch;
      if (activeFilter === 'Tags') return tagMatch;
      
      return titleMatch || contentMatch || tagMatch;
    });
  }, [query, notes, activeFilter]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <Text>{text}</Text>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text>
        {parts.map((part, i) => (
          part.toLowerCase() === highlight.toLowerCase() 
            ? <Text key={i} style={styles.highlight}>{part}</Text>
            : <Text key={i}>{part}</Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <BackIcon />
            </Pressable>
            <Text style={styles.title}>Secure Search</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => setQuery('')}>
            <CloseIcon />
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconWrapper}>
            <SearchIcon />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your decrypted vault..."
            placeholderTextColor={COLORS.textDim}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Encryption Badge */}
        <View style={styles.encryptionBadge}>
          <LockIcon />
          <Text style={styles.encryptionText}>
            Zero-Knowledge Search · Queries never leave this device
          </Text>
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip;
            return (
              <Pressable
                key={chip}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(chip)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.length > 0 && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No matches found in your vault.</Text>
          </View>
        )}

        {results.map((note) => (
          <Pressable 
            key={note.id} 
            style={styles.resultCard}
            onPress={() => router.push(`/(app)/note/${note.id}`)}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {highlightText(note.title, query)}
              </Text>
              {note.folder && (
                <View style={styles.matchTypeBadge}>
                  <Text style={styles.matchTypeText}>{note.folder.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.resultPreview} numberOfLines={2}>
              {highlightText(note.content, query)}
            </Text>
            
            {note.tags.length > 0 && (
              <View style={styles.tagResults}>
                  {note.tags.map(t => (
                      <View key={t} style={[styles.tagChipBase, t.toLowerCase().includes(query.toLowerCase()) && styles.tagChipHighlight]}>
                          <Text style={styles.tagChipText}>{highlightText('#' + t, query)}</Text>
                      </View>
                  ))}
              </View>
            )}

            <View style={styles.resultFooter}>
              <CalendarIcon />
              <Text style={styles.resultDate}>
                {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </Pressable>
        ))}

        {!query && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Enter a search term to find notes securely.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  searchInputContainer: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconWrapper: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLORS.textLight,
    fontSize: 16,
    paddingRight: 16,
  },
  encryptionBadge: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(13, 115, 119, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.15)',
    borderRadius: 12,
  },
  encryptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.vaultTeal,
    letterSpacing: 0.5,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  filterChipActive: {
    backgroundColor: COLORS.vaultTeal,
    borderColor: COLORS.vaultTeal,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  filterTextActive: {
    color: COLORS.vaultBlack,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    flex: 1,
    marginRight: 8,
  },
  highlight: {
    backgroundColor: 'rgba(13, 115, 119, 0.3)',
    color: COLORS.vaultTeal,
    fontWeight: '700',
  },
  matchTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(13, 115, 119, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.2)',
  },
  matchTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.vaultTeal,
  },
  resultPreview: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textDim,
  },
  tagResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagChipBase: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagChipHighlight: {
    borderColor: 'rgba(13, 115, 119, 0.4)',
    backgroundColor: 'rgba(13, 115, 119, 0.05)',
  },
  tagChipText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  resultFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultDate: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.footerText,
    letterSpacing: 0.5,
  },
});
