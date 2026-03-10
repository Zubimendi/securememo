import React, { useState } from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';

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

function ClockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

function ArrowUpLeftIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.footerText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={17} y1={17} x2={7} y2={7} />
      <Polyline points="7 17 7 7 17 7" />
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

// Data definitions
const FILTER_CHIPS = ['All', 'Titles only', 'Content', 'Tags'];
const RECENT_SEARCHES = ['Project Q4 strategy', 'Vault keys backup', '#fitness_goals'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Simple hardcoded checks imitating the search view design
  const showResults = query.length > 0;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Pressable style={styles.iconButton}>
              <BackIcon />
            </Pressable>
            <Text style={styles.title}>Search</Text>
          </View>
          <Pressable style={styles.iconButton}>
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
            placeholder="Search titles, content, tags..."
            placeholderTextColor={COLORS.textDim}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {/* Encryption Badge */}
        <View style={styles.encryptionBadge}>
          <LockIcon />
          <Text style={styles.encryptionText}>
            Client-side search only · Your queries stay on this device
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
        {/* ── Recent Searches ── */}
        {!showResults && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              <Pressable>
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </Pressable>
            </View>

            <View style={styles.recentList}>
              {RECENT_SEARCHES.map((item) => (
                <Pressable key={item} style={styles.recentItem} onPress={() => setQuery(item)}>
                  <View style={styles.recentLeft}>
                    <ClockIcon />
                    <Text style={styles.recentText}>{item}</Text>
                  </View>
                  <ArrowUpLeftIcon />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── Simulated Search Results ── */}
        {showResults && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>RESULTS</Text>

            {/* Result Card 1 */}
            <Pressable style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  Annual <Text style={styles.highlight}>Strategy</Text> 2024
                </Text>
                <View style={styles.matchTypeBadge}>
                  <Text style={styles.matchTypeText}>TITLE</Text>
                </View>
              </View>
              <Text style={styles.resultPreview} numberOfLines={2}>
                Outlining the primary <Text style={styles.highlight}>strategy</Text> for the next four quarters. Key focus remains on end-to-end encryption...
              </Text>
              <View style={styles.resultFooter}>
                <CalendarIcon />
                <Text style={styles.resultDate}>OCT 12</Text>
              </View>
            </Pressable>

            {/* Result Card 2 */}
            <Pressable style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Team Meeting Notes</Text>
                <View style={[styles.matchTypeBadge, styles.matchTypeBadgeContent]}>
                  <Text style={[styles.matchTypeText, styles.matchTypeTextContent]}>CONTENT</Text>
                </View>
              </View>
              <Text style={styles.resultPreview} numberOfLines={2}>
                The team discussed the new marketing <Text style={styles.highlight}>strategy</Text> and how to implement zero-knowledge proofs...
              </Text>
              <View style={styles.resultFooter}>
                <CalendarIcon />
                <Text style={styles.resultDate}>OCT 08</Text>
              </View>
            </Pressable>

            {/* Result Card 3 */}
            <Pressable style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Resource Links</Text>
                <View style={styles.matchTypeBadge}>
                  <Text style={styles.matchTypeText}>TAG</Text>
                </View>
              </View>
              <View style={styles.tagResults}>
                <View style={styles.tagChipBase}>
                  <Text style={styles.tagChipText}>#work</Text>
                </View>
                <View style={[styles.tagChipBase, styles.tagChipHighlight]}>
                  <Text style={styles.tagChipText}><Text style={styles.highlight}>#strategy</Text></Text>
                </View>
                <View style={styles.tagChipBase}>
                  <Text style={styles.tagChipText}>#important</Text>
                </View>
              </View>
            </Pressable>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f', // Matching background-dark from HTML
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 28,
    color: '#f8f6f6', // background-light roughly maps to this slate-100/text primary
  },

  /* Search Input */
  searchInputContainer: {
    position: 'relative',
    height: 52,
    backgroundColor: COLORS.surface, // Maps to card-dark
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.vaultTeal, // Maps to primary
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
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Mimicking JetBrains Mono
    paddingRight: 16,
  },

  /* Encryption Badge */
  encryptionBadge: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(13, 115, 119, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
  },
  encryptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.vaultTeal,
    letterSpacing: 0.3,
  },

  /* Filter Chips */
  filterContainer: {
    marginBottom: 32,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipActive: {
    backgroundColor: COLORS.vaultTeal,
    borderColor: COLORS.vaultTeal,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  filterTextActive: {
    color: '#ffffff',
  },

  /* Main Content Layout */
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // accommodate bottom tab bar
  },

  /* Section Styles */
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.vaultTeal,
    letterSpacing: 1,
  },

  /* Recent UI */
  recentList: {
    gap: 4,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.5)', // Slate-900/50 approx
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentText: {
    fontSize: 14,
    color: '#cbd5e1', // Slate-300
  },

  /* Search Results UI */
  resultCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.4)', // Card-dark with opacity
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9', // Slate-100
  },
  highlight: {
    backgroundColor: COLORS.vaultTeal,
    color: '#ffffff',
  },
  matchTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(13, 115, 119, 0.2)', // primary/20
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.3)',
  },
  matchTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.vaultTeal,
    letterSpacing: -0.5,
  },
  matchTypeBadgeContent: {
    backgroundColor: '#1e293b', // slate-800
    borderColor: '#334155', // slate-700
  },
  matchTypeTextContent: {
    color: '#94a3b8', // slate-400
  },
  resultPreview: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94a3b8', // slate-400
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
    color: COLORS.textDim,
    letterSpacing: 1,
  },

  /* Tag Result variants */
  tagResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagChipBase: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0f172a', // Slate-900
    borderRadius: 4,
  },
  tagChipHighlight: {
    borderWidth: 1,
    borderColor: COLORS.vaultTeal,
  },
  tagChipText: {
    fontSize: 12,
    color: '#cbd5e1', // Slate-300
  },
});
