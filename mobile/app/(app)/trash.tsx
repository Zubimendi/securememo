import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Svg, Path, Rect, Polyline, Line, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/theme';

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

function DeleteIcon({ color = 'rgba(239, 68, 68, 0.6)' }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
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

// Dummy data for trash items
const TRASH_ITEMS = [
  { id: '1', title: 'Q4 Revenue Projections', folder: 'BUSINESS', daysLeft: 23, opacity: 0.6 },
  { id: '2', title: 'Weekend Grocery List', folder: 'PERSONAL', daysLeft: 23, opacity: 0.5 },
  { id: '3', title: 'Old Project Ideas', folder: 'ARCHIVE', daysLeft: 25, opacity: 0.4 },
  { id: '4', title: 'Untethered Thoughts', folder: 'DRAFTS', daysLeft: 28, opacity: 0.3 },
];

export default function TrashScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

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
          <Pressable onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyTrashText}>Empty Trash</Text>
          </Pressable>
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
          {TRASH_ITEMS.map((item) => (
            <View
              key={item.id}
              style={[styles.trashCard, { opacity: item.opacity }]}
            >
              <View style={styles.cardLeft}>
                <View style={styles.folderRow}>
                  <FolderIcon />
                  <Text style={styles.folderText}>{item.folder}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDaysText}>Deletes in {item.daysLeft} days</Text>
              </View>
              <Pressable style={styles.deleteButton}>
                <DeleteIcon />
              </Pressable>
            </View>
          ))}
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
            
            <Text style={styles.modalTitle}>Delete Forever?</Text>
            <Text style={styles.modalSubtitle}>
              This cannot be undone. All 12 deleted notes will be permanently erased.
            </Text>
            
            <View style={styles.modalActionGroup}>
              <Pressable style={styles.deleteAllButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.deleteAllButtonText}>Delete All</Text>
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

  /* Header */
  header: {
    backgroundColor: 'rgba(12, 13, 20, 0.8)',
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  },
  emptyTrashText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2dd4bf', // accent-teal
  },

  /* Warning Banner */
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
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  /* List Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Tab bar padding
  },
  listContainer: {
    gap: 12,
  },

  /* Trash Card */
  trashCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.2)', // slate-800/20
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
  },
  deleteButton: {
    padding: 4,
  },

  /* Modal Bottom Sheet */
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
    backgroundColor: '#334155', // slate-700
    borderRadius: 2,
    marginBottom: 24,
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // #ef4444/10
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
    borderColor: '#334155', // slate-700
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1', // slate-300
  },
});
