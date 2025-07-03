import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, borderRadius, typography } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  fullWidth = true,
  style,
  ...props
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : isFocused ? theme.primary : theme.border,
          },
          style,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: typography.body.fontSize,
            },
            icon && styles.inputWithIcon,
          ]}
          placeholderTextColor={theme.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  icon: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});