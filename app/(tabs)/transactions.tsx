import { router } from "expo-router";
import { Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/atoms/Input';
import { ModalMessage } from '../../components/atoms/ModalMessage';
import { TransactionItem } from '../../components/molecules/TransactionItem';
import { darkTheme, lightTheme, spacing, typography } from '../../constants/theme';
import { useFinanceStore } from '../../stores/financeStore';
import { useThemeStore } from '../../stores/themeStore';

export default function TransactionsScreen() {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useFinanceStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onConfirm?: () => void }>({
    title: '',
    message: '',
    onConfirm: undefined,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      await fetchTransactions();
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, selectedFilter, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = date.toDateString();

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });

    return Object.entries(groups).sort(([a], [b]) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [filteredTransactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleEditTransaction = (transaction: any) => {
    router.push({ pathname: "/sheet", params: { id: transaction.id } });
  };

  const handleDeleteTransaction = (transaction: any) => {
    setModalContent({
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction?",
      onConfirm: () => {
        deleteTransaction(transaction.id);
        setModalVisible(false);
      },
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ModalMessage
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => setModalVisible(false)}
        buttonText="Delete"
        // Confirm deletion on button press
        {...(modalContent.onConfirm && {
          onClose: () => {
            modalContent.onConfirm?.();
            setModalVisible(false);
          },
        })}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Transactions</Text>
      </View>

      <View style={styles.controls}>
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={20} color={theme.textMuted} />}
          style={styles.searchInput}
        />

        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'all' ? theme.primary : theme.surface,
                borderColor: selectedFilter === 'all' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === 'all' ? '#FFFFFF' : theme.text,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'income' ? theme.success : theme.surface,
                borderColor: selectedFilter === 'income' ? theme.success : theme.border,
              },
            ]}
            onPress={() => setSelectedFilter('income')}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === 'income' ? '#FFFFFF' : theme.text,
                },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'expense' ? theme.error : theme.surface,
                borderColor: selectedFilter === 'expense' ? theme.error : theme.border,
              },
            ]}
            onPress={() => setSelectedFilter('expense')}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === 'expense' ? '#FFFFFF' : theme.text,
                },
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransactions} />
        }
      >
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([date, dayTransactions]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={[styles.dateHeader, { color: theme.textSecondary }]}>
                {formatDate(date)}
              </Text>
              {dayTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => handleEditTransaction(transaction)}
                  onDelete={() => handleDeleteTransaction(transaction)}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {searchQuery || selectedFilter !== 'all'
                ? 'No transactions match your search criteria'
                : 'No transactions yet. Start by adding your first transaction!'}
            </Text>
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
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
});