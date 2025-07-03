import { create } from 'zustand';
import { ThemeState } from '../types';
import { Appearance } from 'react-native';

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: Appearance.getColorScheme() === 'dark',
  
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));

// Listen to system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.setState({ isDark: colorScheme === 'dark' });
});