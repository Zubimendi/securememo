import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useVaultStore } from '../store/vaultStore';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Auto-locks the vault after the app has been in the background
 * for longer than the user's configured timeout.
 */
export function useAutoLock() {
  const { lock, isUnlocked } = useVaultStore();
  const { autoLockMinutes } = useSettingsStore();
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          backgroundedAt.current = Date.now();
        }

        if (nextState === 'active' && isUnlocked) {
          const bgTime = backgroundedAt.current;
          if (bgTime) {
            const elapsedMinutes = (Date.now() - bgTime) / 1000 / 60;
            if (elapsedMinutes >= autoLockMinutes) {
              lock();
            }
          }
          backgroundedAt.current = null;
        }
      }
    );

    return () => subscription.remove();
  }, [isUnlocked, autoLockMinutes, lock]);
}