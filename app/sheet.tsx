import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ModalMessage } from "@/components/atoms/ModalMessage";
import {
  borderRadius,
  darkTheme,
  lightTheme,
  spacing,
  typography,
} from "@/constants/theme";
import { useFinanceStore } from "@/stores/financeStore";
import { useThemeStore } from "@/stores/themeStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  IndianRupeeIcon,
  Repeat,
  Type,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTransactionScreen() {
  const {
    categories,
    addTransaction,
    updateTransaction,
    fetchCategories,
    transactions,
  } = useFinanceStore();
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurringFrequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    title: "",
    message: "",
    onClose: undefined,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (id) {
      const tx = transactions.find((t) => t.id === id);
      if (tx) {
        setFormData({
          amount: String(tx.amount),
          description: tx.description,
          categoryId: tx.category_id,
          type: tx.type,
          date: tx.date.split("T")[0],
          isRecurring: tx.is_recurring,
          recurringFrequency: tx.recurring_frequency || "monthly",
        });
      }
    }
  }, [id, transactions]);

  const loadCategories = async () => {
    try {
      await fetchCategories();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type || cat.type === "both",
  );

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (id) {
        await updateTransaction(id, {
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          category_id: formData.categoryId,
          type: formData.type,
          date: formData.date,
          is_recurring: formData.isRecurring,
          recurring_frequency: formData.isRecurring
            ? formData.recurringFrequency
            : null,
        });
        setModalContent({
          title: "Success",
          message: "Transaction updated successfully",
          onClose: () => {
            setModalVisible(false);
            router.back();
          },
        });
      } else {
        await addTransaction({
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          category_id: formData.categoryId,
          type: formData.type,
          date: formData.date,
          is_recurring: formData.isRecurring,
          recurring_frequency: formData.isRecurring
            ? formData.recurringFrequency
            : null,
        });
        setModalContent({
          title: "Success",
          message: "Transaction added successfully",
          onClose: () => {
            setModalVisible(false);
            router.back();
          },
        });
      }
      setModalVisible(true);
    } catch (error: any) {
      setModalContent({
        title: "Error",
        message: error.message || "Failed to save transaction",
        onClose: () => setModalVisible(false),
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Determine if editing or adding
  const isEditing = !!id;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Top bar with grabber and close/add/update buttons */}
      <View style={styles.sheetTopBar}>
        <View className={styles.sheetGrabber} />
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          {isEditing ? "Update Transaction" : "Add Transaction"}
        </Text>
        <TouchableOpacity
          style={styles.sheetCloseBtn}
          onPress={() => router.back()}
        >
          <X size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ModalMessage
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => {
          setModalVisible(false);
          modalContent.onClose && modalContent.onClose();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Transaction Type */}
        <View style={styles.section}>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    formData.type === "expense" ? theme.error : theme.surface,
                  borderColor:
                    formData.type === "expense" ? theme.error : theme.border,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: "expense",
                  categoryId: "",
                }))
              }
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color: formData.type === "expense" ? "#FFFFFF" : theme.text,
                  },
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    formData.type === "income" ? theme.success : theme.surface,
                  borderColor:
                    formData.type === "income" ? theme.success : theme.border,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: "income",
                  categoryId: "",
                }))
              }
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color: formData.type === "income" ? "#FFFFFF" : theme.text,
                  },
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Input
            value={formData.amount}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, amount: text }))
            }
            keyboardType="decimal-pad"
            placeholder="Amount"
            error={errors.amount}
            icon={<IndianRupeeIcon size={14} color={theme.textMuted} />}
            style={styles.input}
            labelStyle={styles.inputLabel}
            showLabel={false}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Input
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Description"
            error={errors.description}
            icon={<Type size={14} color={theme.textMuted} />}
            style={styles.input}
            labelStyle={styles.inputLabel}
            showLabel={false}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          {errors.categoryId && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.categoryId}
            </Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      formData.categoryId === category.id
                        ? category.color
                        : theme.surface,
                    borderColor:
                      formData.categoryId === category.id
                        ? category.color
                        : theme.border,
                  },
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, categoryId: category.id }))
                }
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color:
                        formData.categoryId === category.id
                          ? "#FFFFFF"
                          : theme.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Input
              value={formData.date}
              onChangeText={() => { }} // Disable manual editing
              placeholder="YYYY-MM-DD"
              icon={<Calendar size={14} color={theme.textMuted} />}
              style={styles.input}
              labelStyle={styles.inputLabel}
              showLabel={false}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.date)}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    date: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
        </View>

        {/* Recurring */}
        <View style={styles.section}>
          <View style={styles.recurringSection}>
            <View style={styles.recurringHeader}>
              <Repeat size={14} color={theme.textMuted} />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, marginLeft: spacing.xs },
                ]}
              >
                Recurring
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: formData.isRecurring
                    ? theme.primary
                    : theme.surface,
                  borderColor: formData.isRecurring
                    ? theme.primary
                    : theme.border,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  isRecurring: !prev.isRecurring,
                }))
              }
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: formData.isRecurring ? "#FFFFFF" : theme.text },
                ]}
              >
                {formData.isRecurring ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {formData.isRecurring && (
            <View style={styles.frequencySelector}>
              <Text
                style={[styles.frequencyLabel, { color: theme.textSecondary }]}
              >
                Frequency
              </Text>
              <View style={styles.frequencyButtons}>
                {["daily", "weekly", "monthly", "yearly"].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      {
                        backgroundColor:
                          formData.recurringFrequency === freq
                            ? theme.primary
                            : theme.surface,
                        borderColor:
                          formData.recurringFrequency === freq
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        recurringFrequency: freq as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        {
                          color:
                            formData.recurringFrequency === freq
                              ? "#FFFFFF"
                              : theme.text,
                        },
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <Button
          title={isEditing ? "Update Transaction" : "Add Transaction"}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetTopBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 2,
    backgroundColor: "transparent",
  },
  sheetGrabber: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: 0,
  },
  addButton: {
    padding: 2,
  },
  sheetCloseBtn: {
    padding: 2,
  },
  title: {
    ...typography.h1,
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 16,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  typeToggle: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  typeText: {
    ...typography.body,
    fontWeight: "600",
    fontSize: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  categoryButton: {
    minWidth: 60,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    marginRight: spacing.xs,
  },
  categoryIcon: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryName: {
    ...typography.caption,
    fontWeight: "500",
    textAlign: "center",
    fontSize: 10,
  },
  recurringSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  recurringHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minWidth: 36,
    alignItems: "center",
  },
  toggleText: {
    ...typography.bodySmall,
  },
  toggleText: {
    ...typography.bodySmall,
    fontWeight: "600",
    fontSize: 11,
  },
  frequencySelector: {
    marginTop: spacing.xs,
  },
  frequencyLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
    fontSize: 11,
  },
  frequencyButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  frequencyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  frequencyText: {
    ...typography.caption,
    fontWeight: "500",
    fontSize: 10,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.caption,
    marginBottom: spacing.xs,
    fontSize: 10,
  },
  input: {
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  inputLabel: {
    fontSize: 11,
  },
});
