import { Link, router } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { ModalMessage } from '../../components/atoms/ModalMessage';
import { darkTheme, lightTheme, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onClose?: () => void }>({
    title: '',
    message: '',
    onClose: undefined,
  });

  const { signUp } = useAuthStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      setModalContent({
        title: 'Registration Successful',
        message: 'Please check your email to verify your account.',
        onClose: () => {
          setModalVisible(false);
          router.replace('/(auth)/login');
        },
      });
      setModalVisible(true);
    } catch (error: any) {
      setModalContent({
        title: 'Registration Failed',
        message: error.message || 'An error occurred',
        onClose: () => setModalVisible(false),
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Start your journey to better financial management
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              error={errors.fullName}
              icon={<User size={20} color={theme.textMuted} />}
            />

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
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
              icon={<Lock size={20} color={theme.textMuted} />}
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword}
              icon={<Lock size={20} color={theme.textMuted} />}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
              <Link href="/(auth)/login">
                <Text style={[styles.link, { color: theme.primary }]}>
                  Sign In
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
  },
  link: {
    fontWeight: '600',
  },
});