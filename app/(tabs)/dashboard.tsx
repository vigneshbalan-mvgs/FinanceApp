import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { router } from "expo-router";
import {
  IndianRupee,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatCard } from "../../components/molecules/StatCard";
import { TransactionItem } from "../../components/molecules/TransactionItem";
import { SpendingChart } from "../../components/organisms/SpendingChart";
import {
  darkTheme,
  lightTheme,
  spacing,
  typography,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useFinanceStore } from "../../stores/financeStore";
import { useThemeStore } from "../../stores/themeStore";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    transactions,
    loading,
    fetchTransactions,
    fetchCategories,
    fetchBudgets,
    fetchGoals,
  } = useFinanceStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchBudgets(),
        fetchGoals(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
    const lastMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    };

    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= currentMonth.start && date <= currentMonth.end;
    });

    const lastMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= lastMonth.start && date <= lastMonth.end;
    });

    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const lastIncome = lastMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const lastExpenses = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange =
      lastIncome === 0 ? 0 : ((currentIncome - lastIncome) / lastIncome) * 100;
    const expenseChange =
      lastExpenses === 0
        ? 0
        : ((currentExpenses - lastExpenses) / lastExpenses) * 100;

    return {
      currentIncome,
      currentExpenses,
      balance: currentIncome - currentExpenses,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        label: format(month, "MMM"),
        value: expenses,
      });
    }

    return months;
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Good morning,
          </Text>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.phone || user?.email?.split("@")[0] || "User"}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Balance"
            value={formatCurrency(stats.balance)}
            icon={<IndianRupee size={20} color={theme.primary} />}
          />
          <StatCard
            title="Income"
            value={formatCurrency(stats.currentIncome)}
            change={formatChange(stats.incomeChange)}
            changeType={stats.incomeChange >= 0 ? "positive" : "negative"}
            icon={<TrendingUp size={20} color={theme.success} />}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Expenses"
            value={formatCurrency(stats.currentExpenses)}
            change={formatChange(stats.expenseChange)}
            changeType={stats.expenseChange <= 0 ? "positive" : "negative"}
            icon={<TrendingDown size={20} color={theme.error} />}
          />
          <StatCard
            title="Savings Rate"
            value={`${stats.currentIncome > 0 ? ((stats.balance / stats.currentIncome) * 100).toFixed(1) : 0}%`}
            icon={<Target size={20} color={theme.accent} />}
          />
        </View>

        <SpendingChart
          data={chartData}
          type="line"
          title="Monthly Spending Trend"
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Transactions
          </Text>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No transactions yet. Start by adding your first transaction!
            </Text>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button for Add Transaction */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: theme.primary, borderColor: theme.background },
        ]}
        onPress={() => router.push("/sheet")}
        activeOpacity={0.85}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
