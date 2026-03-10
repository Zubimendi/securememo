import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import FolderCard from '../../src/components/FolderCard';

/* ── Icons ── */

function AddIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.textLight} stroke="none">
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </Svg>
  );
}

function ShieldLockIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.vaultTeal} stroke="none">
      <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </Svg>
  );
}

function CreateFolderIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.footerText} strokeWidth={1.5}>
      <Path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z" />
    </Svg>
  );
}

export default function FoldersScreen() {
  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Folders</Text>
          <Pressable style={styles.addButton}>
            <AddIcon />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Notes are organized on your device only.</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Global Vault Banner ── */}
        <Pressable style={styles.vaultBanner}>
          <View style={styles.vaultBannerLeft}>
            <View style={styles.vaultIconWrapper}>
              <ShieldLockIcon />
            </View>
            <View>
              <Text style={styles.vaultTitle}>All Notes</Text>
              <Text style={styles.vaultSubtitle}>Your entire encrypted vault</Text>
            </View>
          </View>
          <View style={styles.vaultCountBadge}>
            <Text style={styles.vaultCountText}>47</Text>
          </View>
        </Pressable>

        {/* ── Folders Grid ── */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <FolderCard
              name="Work"
              noteCount={12}
              accentColor={COLORS.vaultTeal}
              icon="folder"
              lastEdited="2m ago"
            />
          </View>
          <View style={styles.gridItem}>
            <FolderCard
              name="Personal"
              noteCount={8}
              accentColor={COLORS.amberAccent}
              icon="star"
              lastEdited="1h ago"
            />
          </View>
          <View style={styles.gridItem}>
            <FolderCard
              name="Ideas"
              noteCount={24}
              accentColor={COLORS.rose}
              icon="favorite"
              lastEdited="Yesterday"
            />
          </View>
          <View style={styles.gridItem}>
            <FolderCard
              name="Finance"
              noteCount={3}
              accentColor={COLORS.indigo}
              icon="lock"
              lastEdited="3d ago"
            />
          </View>
          <View style={styles.gridItem}>
            <FolderCard
              name="Archive"
              noteCount={0}
              accentColor={COLORS.slate500}
              icon="archive"
              lastEdited="-"
              dimmed
            />
          </View>

          {/* New Folder Button Placeholder */}
          <View style={styles.gridItem}>
            <Pressable style={styles.createFolderContainer}>
              <CreateFolderIcon />
              <Text style={styles.createFolderText}>New Folder</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d14', // Matches the specific HTML hex exactly
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: COLORS.textLight,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.footerText,
    marginTop: 4,
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // accommodate bottom tab bar
  },

  /* Vault Banner */
  vaultBanner: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 16,

    // React Native minimal shadow approaching the 'teal-glow'
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  vaultBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vaultIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.tealAlpha10,
    borderWidth: 1,
    borderColor: COLORS.tealAlpha20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTitle: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  vaultSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  vaultCountBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.tealAlpha20,
    borderWidth: 1,
    borderColor: COLORS.tealAlpha30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultCountText: {
    color: COLORS.vaultTeal,
    fontWeight: '700',
    fontSize: 14,
  },

  /* Grid Area */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%', // Rough 2-column layout accounting for gaps
  },

  /* Create Folder Placaholder */
  createFolderContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createFolderText: {
    fontSize: 12,
    color: COLORS.footerText,
  },
});
