import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/providers/AuthProvider';
import { useVaultStore } from '../src/store/vaultStore';
import { isVaultSetup } from '../src/crypto/vault';
import { COLORS } from '../src/theme';

export default function Index() {
  const { session, isLoading: authLoading } = useAuth();
  const { isUnlocked, hydrate } = useVaultStore();
  const [vaultSetup, setVaultSetup] = React.useState<boolean | null>(null);

  useEffect(() => {
    console.log("[Index] Initializing session/vault status...");
    isVaultSetup().then(flag => {
      console.log("[Index] Vault Setup Flag:", flag);
      setVaultSetup(flag);
    });
    hydrate();
  }, []);

  console.log("[Index] Current State:", { session: !!session, vaultSetup, isUnlocked, authLoading });

  if (authLoading || vaultSetup === null) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.vaultBlack, justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.vaultTeal} />
      </View>
    );
  }

  // Not signed in to Supabase -> Welcome
  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Signed in, but no vault setup on this device -> Create Vault
  // (Note: In production, we should also check the backend via GET_ME to see if user has a vault config)
  if (!vaultSetup) {
    return <Redirect href="/(auth)/create-vault" />;
  }

  // Vault is setup but locked -> Unlock
  if (!isUnlocked) {
    return <Redirect href="/(auth)/unlock" />;
  }

  // All good -> Notes
  return <Redirect href="/(app)" />;
}
