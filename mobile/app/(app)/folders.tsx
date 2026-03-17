import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';
import FolderCard from '../../src/components/FolderCard';
import { useNotesStore } from '../../src/store/notesStore';

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

const FOLDER_COLORS = [
    COLORS.vaultTeal,
    COLORS.amberAccent,
    COLORS.rose,
    COLORS.indigo,
    COLORS.slate500,
];

export default function FoldersScreen() {
  const router = useRouter();
  const { notes } = useNotesStore();

  const folderStats = useMemo(() => {
    const stats: Record<string, { count: number, lastUpdate: string }> = {};
    const activeNotes = notes.filter(n => !n.deleted);

    activeNotes.forEach(note => {
        if (!note.folder) return;
        if (!stats[note.folder]) {
            stats[note.folder] = { count: 0, lastUpdate: note.updatedAt };
        }
        stats[note.folder].count++;
        if (new Date(note.updatedAt) > new Date(stats[note.folder].lastUpdate)) {
            stats[note.folder].lastUpdate = note.updatedAt;
        }
    });

    return Object.entries(stats).map(([name, data], index) => ({
        name,
        ...data,
        color: FOLDER_COLORS[index % FOLDER_COLORS.length]
    })).sort((a, b) => b.count - a.count);
  }, [notes]);

  const totalActiveNotes = useMemo(() => notes.filter(n => !n.deleted).length, [notes]);

  const handleCreateFolder = () => {
      Alert.prompt(
          'New Folder',
          'Enter folder name:',
          [
              { text: 'Cancel', style: 'cancel' },
              { 
                  text: 'Create', 
                  onPress: (folderName: string | undefined) => {
                      if (folderName?.trim()) {
                          router.push({
                              pathname: '/(app)/note/new',
                              params: { initialFolder: folderName.trim() }
                          });
                      }
                  } 
              }
          ]
      );
  };

  const getTimeAgo = (dateStr: string) => {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Folders</Text>
          <Pressable style={styles.addButton} onPress={() => router.push('/(app)/note/new')}>
            <AddIcon />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>E2EE folders group your notes on-device.</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Global Vault Banner ── */}
        <Pressable 
            style={styles.vaultBanner}
            onPress={() => router.push('/(app)')}
        >
          <View style={styles.vaultBannerLeft}>
            <View style={styles.vaultIconWrapper}>
              <ShieldLockIcon />
            </View>
            <View>
              <Text style={styles.vaultTitle}>All Items</Text>
              <Text style={styles.vaultSubtitle}>Primary encrypted vault</Text>
            </View>
          </View>
          <View style={styles.vaultCountBadge}>
            <Text style={styles.vaultCountText}>{totalActiveNotes}</Text>
          </View>
        </Pressable>

        {/* ── Folders Grid ── */}
        <View style={styles.grid}>
          {folderStats.map((folder) => (
            <View key={folder.name} style={styles.gridItem}>
              <FolderCard
                name={folder.name}
                noteCount={folder.count}
                accentColor={folder.color}
                icon="folder"
                lastEdited={getTimeAgo(folder.lastUpdate)}
                onPress={() => router.push({
                   pathname: '/(app)',
                   params: { folder: folder.name }
                })}
              />
            </View>
          ))}

          {/* New Folder Button */}
          <View style={styles.gridItem}>
            <Pressable style={styles.createFolderContainer} onPress={handleCreateFolder}>
              <CreateFolderIcon />
              <Text style={styles.createFolderText}>Add Folder</Text>
            </Pressable>
          </View>
        </View>

        {folderStats.length === 0 && (
            <View style={styles.emptyPrompt}>
                <Text style={styles.emptyPromptText}>Create a new note and add a folder name to organize your vault.</Text>
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
    fontWeight: '600',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.footerText,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  vaultBanner: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.4)',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 20,
    shadowColor: COLORS.vaultTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  vaultBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vaultIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 115, 119, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  vaultSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  vaultCountBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 115, 119, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 115, 119, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultCountText: {
    color: COLORS.vaultTeal,
    fontWeight: '800',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  createFolderContainer: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 20,
    padding: 20,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  createFolderText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.footerText,
  },
  emptyPrompt: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  emptyPromptText: {
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 20,
    textAlign: 'center',
  },
});
