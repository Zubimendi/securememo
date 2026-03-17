import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Polyline, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client';
import {COLORS, SPACING, BORDER_RADIUS} from '../../src/theme';
import { useNotesStore } from '../../src/store/notesStore';
import { RESTORE_NOTE, EMPTY_TRASH } from '../../src/graphql/mutations';
import { GET_NOTES } from '../../src/graphql/queries';

/* ── Icons ── */

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
    </Svg>
  );
}

function FolderIcon({ color = "#64748b" }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function RestoreIcon({ color = COLORS.vaultTeal }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Path d="M3 3v5h5" />
    </Svg>
  );
}

function DeleteForeverIcon({ color = '#ef4444' }) {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="14" y2="17" />
      <Line x1="14" y1="11" x2="10" y2="17" />
    </Svg>
  );
}

export default function TrashScreen() {
  const router = useRouter();
  const { notes, updateNote, clearMemory } = useNotesStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const trashNotes = useMemo(() => notes.filter(n => n.deleted), [notes]);

  const [restoreNoteMutation] = useMutation(RESTORE_NOTE, {
    refetchQueries: [{ query: GET_NOTES, variables: { limit: 100 } }],
  });

  const [emptyTrashMutation] = useMutation(EMPTY_TRASH, {
    refetchQueries: [{ query: GET_NOTES, variables: { limit: 100 } }],
  });

  const handleRestore = async (id: string) => {
    try {
      await restoreNoteMutation({ variables: { id } });
      updateNote(id, { deleted: false });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEmptyTrash = async () => {
    setIsProcessing(true);
    try {
      await emptyTrashMutation();
      // In a real app, we'd only remove the deleted notes from store, 
      // but refetchQueries will handle the full update.
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const daysUntilPurge = (isoString: string) => {
    const deletedDate = new Date(isoString);
    const purgeDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = purgeDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <BackIcon />
            </Pressable>
            <Text style={styles.title}>Trash</Text>
          </View>
          {trashNotes.length > 0 && (
            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyTrashText}>Empty Trash</Text>
            </Pressable>
          )}
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIndicator} />
          <Text style={styles.warningText}>
            Deleted notes are permanently erased after 30 days or when you empty trash.
          </Text>
        </View>
      </View>

      {/* ── Main List Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {trashNotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Trash is empty</Text>
              <Text style={styles.emptySubtitle}>Any notes you delete will appear here for 30 days.</Text>
            </View>
          ) : (
            trashNotes.map((item) => (
              <View
                key={item.id}
                style={styles.trashCard}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.folderRow}>
                    <FolderIcon />
                    <Text style={styles.folderText}>{item.folder || 'UNCATEGORIZED'}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title || 'Untitled Note'}</Text>
                  <Text style={styles.cardDaysText}>Deletes in {daysUntilPurge(item.updatedAt)} days</Text>
                </View>
                <Pressable style={styles.restoreButton} onPress={() => handleRestore(item.id)}>
                  <RestoreIcon />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Delete Confirmation Modal Bottom Sheet ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.pullIndicator} />
            
            <View style={styles.modalIconWrapper}>
              <DeleteForeverIcon />
            </View>
            
            <Text style={styles.modalTitle}>Empty Trash?</Text>
            <Text style={styles.modalSubtitle}>
              This will permanently delete {trashNotes.length} notes. This action cannot be undone.
            </Text>
            
            <View style={styles.modalActionGroup}>
              <Pressable 
                style={styles.deleteAllButton} 
                onPress={handleEmptyTrash}
                disabled={isProcessing}
              >
                {isProcessing ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.deleteAllButtonText}>Confirm Permanent Delete</Text>
                )}
              </Pressable>
              
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d14',
  },
  header: {
    backgroundColor: 'rgba(12, 13, 20, 0.8)',
    paddingTop: Platform.OS === 'ios' ? 48 : 0,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 64,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 24,
    color: '#f0f4f8',
    fontWeight: '600',
  },
  emptyTrashText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.vaultTeal,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#1a0a0a',
    padding: 12,
    position: 'relative',
  },
  warningIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#ef4444',
  },
  warningText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    opacity: 0.8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  listContainer: {
    gap: 12,
  },
  trashCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  folderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#f0f4f8',
    lineHeight: 22,
  },
  cardDaysText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
    opacity: 0.7,
  },
  restoreButton: {
    padding: 12,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  pullIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 24,
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    color: '#f0f4f8',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 32,
    lineHeight: 20,
  },
  modalActionGroup: {
    width: '100%',
    gap: 12,
  },
  deleteAllButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#ef4444',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#f0f4f8',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
