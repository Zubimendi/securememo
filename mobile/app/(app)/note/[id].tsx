import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@apollo/client';
import { Svg, Path, Line } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/theme';
import { useNotesStore } from '../../../src/store/notesStore';
import { useVaultStore } from '../../../src/store/vaultStore';
import EncryptionStatusBar from '../../../src/components/EncryptionStatusBar';
import FormattingToolbar from '../../../src/components/FormattingToolbar';
import TagChip from '../../../src/components/TagChip';
import { UPDATE_NOTE, DELETE_NOTE } from '../../../src/graphql/mutations';
import { GET_NOTES } from '../../../src/graphql/queries';

/* ── Icons ── */

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.textMuted} stroke="none">
      <Path d="M19 12H5" stroke={COLORS.textMuted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19l-7-7 7-7" stroke={COLORS.textMuted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MoreIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.textMuted} stroke="none">
      <Path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </Svg>
  );
}

function AddIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={COLORS.darkGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, deleteNote, encryptNote } = useNotesStore();
  const { vaultKey } = useVaultStore();

  const note = notes.find(n => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [folder, setFolder] = useState<string | null>(note?.folder || null);
  const [activeFormat, setActiveFormat] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [updateNoteMutation] = useMutation(UPDATE_NOTE);
  const [deleteNoteMutation] = useMutation(DELETE_NOTE, {
    refetchQueries: [{ query: GET_NOTES, variables: { limit: 100 } }],
  });

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  // Auto-save logic
  useEffect(() => {
    if (!note || !vaultKey) return;
    
    // Check if changed
    if (title === note.title && body === note.content && JSON.stringify(tags) === JSON.stringify(note.tags)) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, body, tags, folder]);

  const handleSave = async () => {
    if (!vaultKey || !id) return;
    setIsSaving(true);
    
    try {
      const payload = await encryptNote({
        title: title.trim() || 'Untitled',
        content: body,
        folder,
        tags,
      }, vaultKey);

      await updateNoteMutation({
        variables: {
          id,
          input: {
            encryptedTitle: payload.encryptedTitle,
            encryptedContent: payload.encryptedContent,
            encryptedFolder: payload.encryptedFolder,
            encryptedTags: payload.encryptedTags,
            contentHash: payload.contentHash,
            byteSize: payload.byteSize,
          }
        }
      });

      updateNote(id, { 
        title: title.trim() || 'Untitled', 
        content: body, 
        folder, 
        tags, 
        updatedAt: new Date().toISOString() 
      });
    } catch (err: any) {
      console.error('Update failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Move to Trash?',
      'You can restore this note from the trash later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Move to Trash', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNoteMutation({ variables: { id } });
              deleteNote(id);
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const handleBack = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      await handleSave();
    }
    router.back();
  }, [router, title, body, tags, folder, vaultKey, id]);

  if (!note && !isSaving) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.textMuted }}>Note not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.vaultTeal }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBack}>
          <BackIcon />
        </Pressable>

        <View style={styles.folderChip}>
          <Text style={styles.folderChipText}>{folder || 'Uncategorized'}</Text>
        </View>

        <Pressable style={styles.headerButton} onPress={handleDelete}>
          <MoreIcon />
        </Pressable>
      </View>

      {/* ── Encryption Status ── */}
      <EncryptionStatusBar saved={!isSaving} label={isSaving ? "🔐 Saving..." : "🔐 End-to-End Encrypted"} />

      {/* ── Editor Area ── */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={COLORS.darkGray}
          value={title}
          onChangeText={setTitle}
          multiline={false}
          returnKeyType="next"
        />

        {/* Tags */}
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
          <Pressable style={styles.addTagButton}>
            <AddIcon />
          </Pressable>
        </View>

        {/* Body */}
        <TextInput
          style={styles.bodyInput}
          placeholder="Start writing..."
          placeholderTextColor={COLORS.darkGray}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />

        {/* Metadata footer */}
        <View style={styles.metadataFooter}>
          <Text style={styles.metadataText}>
            {wordCount} words · Updated {new Date(note?.updatedAt || '').toLocaleString()}
          </Text>
        </View>
      </ScrollView>

      {/* ── Formatting Toolbar ── */}
      <FormattingToolbar
        activeFormat={activeFormat as any}
        onFormat={(action) => setActiveFormat(action)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    height: Platform.OS === 'ios' ? 100 : 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  folderChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  folderChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 96,
  },
  titleInput: {
    fontSize: 28,
    color: COLORS.textLight,
    fontWeight: '400',
    marginBottom: 24,
    padding: 0,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  addTagButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 25.6,
    color: COLORS.textMuted,
    minHeight: Platform.OS === 'ios' ? 400 : 300,
    padding: 0,
  },
  metadataFooter: {
    marginTop: 32,
    marginBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  metadataText: {
    fontSize: 11,
    color: COLORS.darkGray,
  },
});
