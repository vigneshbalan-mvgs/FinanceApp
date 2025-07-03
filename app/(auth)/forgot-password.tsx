import { Link, router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { ModalMessage } from '../../components/atoms/ModalMessage';
import { darkTheme, lightTheme, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onClose?: () => void }>({
    title: '',
    message: '',
    onClose: undefined,
  });

  const { resetPassword } = useAuthStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await resetPassword(email);
      setModalContent({
        title: 'Email Sent',
        message: 'Please check your email for password reset instructions.',
        onClose: () => setModalVisible(false),
      });
      setModalVisible(true);
    } catch (error: any) {
      setModalContent({
        title: 'Reset Failed',
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="ghost"
              size="small"
            />
            <Text style={[styles.title, { color: theme.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
              icon={<Mail size={20} color={theme.textMuted} />}
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleResetPassword}
              loading={loading}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Remember your password?{' '}
              <Link href="/(auth)/login">
                <Text style={[styles.link, { color: theme.primary }]}>
                  Sign In
                </Text>
              </Link>
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
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