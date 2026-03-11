import { Redirect } from 'expo-router';

/**
 * Entry point that bypasses auth for preview purposes.
 * Redirects directly to the main application tabs.
 */
export default function Index() {
  return <Redirect href="/(app)" />;
}
