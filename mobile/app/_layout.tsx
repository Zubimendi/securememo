import { Slot } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { COLORS } from '../src/theme';
import { apolloClient } from '../src/graphql/client';
import { AuthProvider } from '../src/providers/AuthProvider';

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.vaultBlack} />
          <Slot />
        </View>
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
