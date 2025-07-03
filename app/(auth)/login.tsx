import { Link, router } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/atoms/Button";
import { Input } from "../../components/atoms/Input";
import { ModalMessage } from "../../components/atoms/ModalMessage";
import {
  darkTheme,
  lightTheme,
  spacing,
  typography,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    title: "",
    message: "",
    onClose: undefined,
  });

  const { signIn } = useAuthStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signIn(email, password);
      setModalContent({
        title: "Login Successful",
        message: "Welcome back!",
        onClose: () => setModalVisible(false),
      });
      setModalVisible(true);
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      setModalContent({
        title: "Login Failed",
        message: error.message || "An error occurred",
        onClose: () => setModalVisible(false),
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ModalMessage
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => {
          setModalVisible(false);
          modalContent.onClose && modalContent.onClose();
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to continue managing your finances
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              icon={<Mail size={20} color={theme.textMuted} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              error={errors.password}
              icon={<Lock size={20} color={theme.textMuted} />}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
            />

            <View style={styles.forgotPassword}>
              <Link href="/(auth)/forgot-password">
                <Text style={[styles.link, { color: theme.primary }]}>
                  Forgot your password?
                </Text>
              </Link>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?{" "}
              <Link href="/(auth)/register">
                <Text style={[styles.link, { color: theme.primary }]}>
                  Sign Up
                </Text>
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    maxWidth: 280,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    ...typography.body,
  },
  link: {
    fontWeight: "600",
  },
});
