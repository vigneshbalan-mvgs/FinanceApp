import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Budget } from '../../types';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, typography, borderRadius } from '../../constants/theme';
import { Card } from '../atoms/Card';

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
  const isOverBudget = budget.spent > budget.amount;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card padding="md" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: budget.category?.color || theme.primary },
            ]}
          >
            <Text style={styles.categoryIconText}>
              {budget.category?.icon || '💰'}
            </Text>
          </View>
          <View>
            <Text style={[styles.categoryName, { color: theme.text }]}>
              {budget.category?.name}
            </Text>
            <Text style={[styles.period, { color: theme.textSecondary }]}>
              {budget.period}
            </Text>
          </View>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, { color: isOverBudget ? theme.error : theme.text }]}>
            {formatAmount(budget.spent)}
          </Text>
          <Text style={[styles.total, { color: theme.textSecondary }]}>
            of {formatAmount(budget.amount)}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: theme.borderLight },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isOverBudget ? theme.error : theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: theme.textMuted }]}>
          {percentage.toFixed(0)}% used
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    ...typography.body,
    fontWeight: '600',
  },
  period: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  amounts: {
    alignItems: 'flex-end',
  },
  spent: {
    ...typography.body,
    fontWeight: '700',
  },
  total: {
    ...typography.caption,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  percentage: {
    ...typography.caption,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});