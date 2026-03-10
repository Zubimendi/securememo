import { Stack } from 'expo-router';
import { COLORS } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.vaultBlack },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="create-vault" />
      <Stack.Screen name="recovery-key" />
      <Stack.Screen name="unlock" />
    </Stack>
  );
}
