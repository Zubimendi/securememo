import { gql } from '@apollo/client';

export const SETUP_VAULT = gql`
  mutation SetupVault($input: SetupVaultInput!) {
    setupVault(input: $input) {
      id
      argon2Salt
      argon2Memory
      argon2Iterations
      argon2Parallelism
      createdAt
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      encryptedTitle
      encryptedContent
      encryptedFolder
      encryptedTags
      pinned
      deleted
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      updatedAt
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`;

export const RESTORE_NOTE = gql`
  mutation RestoreNote($id: ID!) {
    restoreNote(id: $id)
  }
`;

export const EMPTY_TRASH = gql`
  mutation EmptyTrash {
    emptyTrash
  }
`;