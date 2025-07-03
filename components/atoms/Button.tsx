import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, borderRadius, typography } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.secondary,
          borderColor: theme.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: theme.border,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...styles.text,
      color: variant === 'outline' || variant === 'ghost' ? theme.text : '#FFFFFF',
    };

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          fontSize: 14,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      case 'large':
        return {
          ...baseStyle,
          fontSize: 18,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          ...baseStyle,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && { opacity: 0.6 },
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.text : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});