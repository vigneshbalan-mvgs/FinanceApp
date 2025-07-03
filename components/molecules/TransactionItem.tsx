import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  darkTheme,
  lightTheme,
  spacing,
  typography,
} from "../../constants/theme";
import { useThemeStore } from "../../stores/themeStore";
import { Transaction } from "../../types";
import { Card } from "../atoms/Card";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);

    return type === "income" ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card padding="md" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.left}>
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor: transaction.category?.color || theme.primary,
                },
              ]}
            >
              <Text style={styles.categoryIconText}>
                {transaction.category?.icon || "💰"}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.description, { color: theme.text }]}>
                {transaction.description}
              </Text>
              <Text style={[styles.category, { color: theme.textSecondary }]}>
                {transaction.category?.name}
              </Text>
              <Text style={[styles.date, { color: theme.textMuted }]}>
                {format(new Date(transaction.date), "MMM dd, yyyy")}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    transaction.type === "income" ? theme.success : theme.error,
                },
              ]}
            >
              {formatAmount(transaction.amount, transaction.type)}
            </Text>
            {transaction.is_recurring && (
              <Text style={[styles.recurring, { color: theme.textMuted }]}>
                Recurring
              </Text>
            )}
          </View>
          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
                <Edit size={16} color="#888" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
                <Trash2 size={16} color="#e11d48" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  categoryIconText: {
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  description: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  category: {
    ...typography.bodySmall,
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: 2,
  },
  recurring: {
    ...typography.caption,
    fontStyle: "italic",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
