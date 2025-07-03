import { Stack } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme } from '../../constants/theme';

export default function AuthLayout() {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}