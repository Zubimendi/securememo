import { Slot } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.vaultBlack} />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.vaultBlack,
  },
});
