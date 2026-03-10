import { create } from 'zustand';

interface SettingsState {
  autoLockMinutes: number;
  biometricsEnabled: boolean;

  setAutoLockMinutes: (minutes: number) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  autoLockMinutes: 5,
  biometricsEnabled: false,

  setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
  setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
}));
