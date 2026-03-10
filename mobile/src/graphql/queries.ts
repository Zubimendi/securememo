import { gql } from '@apollo/client';

export const GET_VAULT_CONFIG = gql`
  query GetVaultConfig {
    vaultConfig {
      id
      encryptedVaultKey
      argon2Salt
      argon2Memory
      argon2Iterations
      argon2Parallelism
      encryptedRecoveryKey
      recoveryKeySalt
    }
  }
`;

export const GET_NOTES = gql`
  query GetNotes($limit: Int, $offset: Int) {
    notes(limit: $limit, offset: $offset) {
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

export const SYNC_NOTES = gql`
  query SyncNotes($since: String!) {
    syncNotes(since: $since) {
      notes {
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
      deletedIds
      serverTime
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      noteCount
      vaultConfig {
        id
        createdAt
      }
    }
  }
`;