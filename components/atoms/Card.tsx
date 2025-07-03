import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, borderRadius } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  elevated = true,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          padding: spacing[padding],
          shadowColor: theme.shadow,
          elevation: elevated ? 3 : 0,
          shadowOpacity: elevated ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
  },
});