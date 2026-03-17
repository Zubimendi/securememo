import React, { useState, useCallback, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client';
import { Svg, Path, Line } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/theme';
import { useNotesStore } from '../../../src/store/notesStore';
import { useVaultStore } from '../../../src/store/vaultStore';
import EncryptionStatusBar from '../../../src/components/EncryptionStatusBar';
import FormattingToolbar from '../../../src/components/FormattingToolbar';
import TagChip from '../../../src/components/TagChip';
import { CREATE_NOTE } from '../../../src/graphql/mutations';
import { GET_NOTES } from '../../../src/graphql/queries';

/* ── Icons ── */

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
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

export default function NewNoteScreen() {
  const router = useRouter();
  const { vaultKey } = useVaultStore();
  const { encryptNote, decryptNote, addNote } = useNotesStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const [createNoteMutation] = useMutation(CREATE_NOTE, {
    refetchQueries: [{ query: GET_NOTES, variables: { limit: 100 } }],
  });

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const handleBack = useCallback(async () => {
    // Auto-save if there is content
    if ((title.trim() || body.trim()) && vaultKey && !isSaving) {
      await handleSave();
    }
    router.back();
  }, [router, title, body, vaultKey, isSaving]);

  const handleSave = async () => {
    if (!vaultKey) return;
    if (!title.trim() && !body.trim()) return;

    setIsSaving(true);
    try {
      const payload = await encryptNote({
        title: title.trim() || 'Untitled',
        content: body,
        folder,
        tags,
      }, vaultKey);

      const { data } = await createNoteMutation({
        variables: {
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

      if (data?.createNote) {
        const decrypted = await decryptNote(data.createNote, vaultKey);
        addNote(decrypted);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

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

        <Pressable style={styles.folderChip} onPress={() => {/* Change folder */}}>
          <Text style={styles.folderChipText}>{folder || 'Uncategorized'}</Text>
        </Pressable>

        <View style={styles.headerActions}>
          {isSaving && <ActivityIndicator size="small" color={COLORS.vaultTeal} style={{ marginRight: 8 }} />}
          <Pressable style={styles.headerButton}>
            <MoreIcon />
          </Pressable>
        </View>
      </View>

      {/* ── Encryption Status ── */}
      <EncryptionStatusBar saved={!isSaving} label={isSaving ? "🔐 Encrypting..." : "🔐 End-to-End Encrypted"} />

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
          autoFocus
          multiline={false}
          returnKeyType="next"
        />

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>
        )}

        {/* Add tag button */}
        <Pressable style={styles.addTagRow} onPress={() => {/* Add tag logic */}}>
          <AddIcon />
          <Text style={styles.addTagText}>Add tag</Text>
        </Pressable>

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
            {wordCount} words · Last edited just now
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
  },
  addTagText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 25.6,
    color: COLORS.textMuted,
    minHeight:Platform.OS === 'ios' ? 400 : 300,
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
