import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, typography } from '../../constants/theme';
import { Card } from '../atoms/Card';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return theme.success;
      case 'negative':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  return (
    <Card padding="md" style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {change && (
        <Text style={[styles.change, { color: getChangeColor() }]}>{change}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  icon: {
    opacity: 0.7,
  },
  value: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  change: {
    ...typography.caption,
    fontWeight: '500',
  },
});