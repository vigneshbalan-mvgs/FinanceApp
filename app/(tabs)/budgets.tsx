import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Target } from 'lucide-react-native';
import { useFinanceStore } from '../../stores/financeStore';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, typography } from '../../constants/theme';
import { BudgetCard } from '../../components/molecules/BudgetCard';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card } from '../../components/atoms/Card';

export default function BudgetsScreen() {
  const { budgets, categories, loading, fetchBudgets, fetchCategories, addBudget } = useFinanceStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchBudgets(), fetchCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const availableCategories = categories.filter(
    cat => !budgets.some(budget => budget.category_id === cat.id) && 
          (cat.type === 'expense' || cat.type === 'both')
  );

  const handleAddBudget = async () => {
    if (!formData.categoryId || !formData.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    try {
      setFormLoading(true);
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await addBudget({
        category_id: formData.categoryId,
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      setFormData({ categoryId: '', amount: '', period: 'monthly' });
      setShowAddForm(false);
      Alert.alert('Success', 'Budget created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create budget');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Budgets</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {showAddForm && (
          <Card padding="md" style={styles.addForm}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              Create New Budget
            </Text>
            
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryList}>
                  {availableCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor: formData.categoryId === category.id 
                            ? category.color 
                            : theme.surface,
                          borderColor: formData.categoryId === category.id 
                            ? category.color 
                            : theme.border,
                        },
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            color: formData.categoryId === category.id 
                              ? '#FFFFFF' 
                              : theme.text,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Input
              label="Budget Amount"
              value={formData.amount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <View style={styles.periodSelector}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Period
              </Text>
              <View style={styles.periodButtons}>
                {['weekly', 'monthly', 'yearly'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      {
                        backgroundColor: formData.period === period ? theme.primary : theme.surface,
                        borderColor: formData.period === period ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, period: period as any }))}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        {
                          color: formData.period === period ? '#FFFFFF' : theme.text,
                        },
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                size="medium"
              />
              <Button
                title="Create Budget"
                onPress={handleAddBudget}
                loading={formLoading}
                size="medium"
              />
            </View>
          </Card>
        )}

        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Target size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Budgets Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Create your first budget to start tracking your spending goals
            </Text>
            {!showAddForm && (
              <Button
                title="Create Budget"
                onPress={() => setShowAddForm(true)}
                style={styles.emptyButton}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  addForm: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  formField: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  categoryOptionText: {
    ...typography.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  periodSelector: {
    marginBottom: spacing.md,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 150,
  },
});