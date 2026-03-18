import { Slot, useRouter, useSegments } from 'expo-router';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { useEffect, useState } from 'react';
import { COLORS } from '../src/theme';
import { apolloClient } from '../src/graphql/client';
import { AuthProvider, useAuth } from '../src/providers/AuthProvider';
import { useVaultStore } from '../src/store/vaultStore';
import { isVaultSetup } from '../src/crypto/vault';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading: authLoading } = useAuth();
  const { isUnlocked, hydrate } = useVaultStore();
  const [vaultSetup, setVaultSetup] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    isVaultSetup().then(setVaultSetup);
    hydrate();
  }, []);

  useEffect(() => {
    if (authLoading || vaultSetup === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log("[AuthGuard] State Change:", { session: !!session, vaultSetup, inAuthGroup });

    if (!session) {
      if (!inAuthGroup) {
        console.log("[AuthGuard] Redirecting to Welcome (no session)");
        router.replace('/(auth)/welcome');
      }
    } else if (!vaultSetup) {
      const isNavigatingToVaultSetup = segments[1] === 'create-vault' || segments[1] === 'recovery-key';
      if (!isNavigatingToVaultSetup) {
        console.log("[AuthGuard] Redirecting to Create Vault");
        router.replace('/(auth)/create-vault');
      }
    } else if (!isUnlocked) {
      if (segments[1] !== 'unlock') {
        console.log("[AuthGuard] Redirecting to Unlock");
        router.replace('/(auth)/unlock');
      }
    } else if (inAuthGroup) {
      console.log("[AuthGuard] Redirecting to App (unlocked)");
      router.replace('/(app)');
    }
  }, [session, vaultSetup, isUnlocked, authLoading, segments]);

  if (authLoading || vaultSetup === null) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.vaultBlack, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.vaultTeal} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <AuthGuard>
          <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.vaultBlack} />
            <Slot />
          </View>
        </AuthGuard>
      </AuthProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
});
