import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

export default function RootLayout() {
  useFrameworkReady();

  // Use the Zustand hook directly so this component subscribes to changes
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialize = useAuthStore((state) => state.initialize);
  const { isDark } = useThemeStore();

  useEffect(() => {
    // Initialize auth state
    initialize();
  }, []);

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen
          name="sheet"
          options={{
            title: "Add Transaction",
            presentation: "formSheet",
            gestureDirection: "vertical",
            animation: "slide_from_bottom",
            sheetGrabberVisible: true,
            sheetInitialDetentIndex: 0,
            sheetAllowedDetents: [0.8, 1.0],
            sheetCornerRadius: 20,
            sheetExpandsWhenScrolledToEdge: true,
            sheetElevation: 24,
          }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}
