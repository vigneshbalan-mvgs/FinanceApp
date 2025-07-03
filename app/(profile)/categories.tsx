import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ModalMessage } from '@/components/atoms/ModalMessage';
import { borderRadius, darkTheme, lightTheme, spacing, typography } from '@/constants/theme';
import { useFinanceStore } from '@/stores/financeStore';
import { useThemeStore } from '@/stores/themeStore';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_TYPES = ['expense', 'income', 'both'];

export default function CategoriesScreen() {
    const {
        categories : categoriesList,
        fetchCategories,
        addCategory,
        deleteCategory,
        loading,
    } = useFinanceStore();
    const { isDark } = useThemeStore();
    const theme = isDark ? darkTheme : lightTheme;

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; message: string; onClose?: () => void }>({
        title: '',
        message: '',
        onClose: undefined,
    });

    // New category state
    const [formData, setFormData] = useState({
        name: '',
        icon: '',
        color: '#007bff',
        type: CATEGORY_TYPES[0] as 'expense' | 'income' | 'both',
        is_default: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Always fetch categories on mount and after add/delete
        fetchCategories();
    }, []);

    // Helper to log categories
    function getCategoriesLog() {
        try {
            return categoriesList.map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                icon: c.icon,
                color: c.color,
                is_default: c.is_default,
            }));
        } catch (e) {
            return categoriesList;
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.icon.trim()) newErrors.icon = 'Icon is required';
        if (!formData.color.trim()) newErrors.color = 'Color is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCategory = async () => {
        if (!validateForm()) return;
        try {
            await addCategory({
                name: formData.name.trim(),
                icon: formData.icon.trim(),
                color: formData.color.trim(),
                type: formData.type,
                is_default: false,
            });
            setFormData({
                name: '',
                icon: '',
                color: '#007bff',
                type: CATEGORY_TYPES[0] as 'expense' | 'income' | 'both',
                is_default: false,
            });
            setModalVisible(false); // Close the create modal immediately
            await fetchCategories(); // Always fetch after add
            setModalContent({
                title: 'Success',
                message: 'Category added successfully',
                onClose: () => setModalContent({ title: '', message: '', onClose: undefined }),
            });
        } catch (e: any) {
            setModalContent({
                title: 'Error',
                message: e.message || 'Failed to add category',
                onClose: () => setModalContent({ title: '', message: '', onClose: undefined }),
            });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await deleteCategory(id);
            await fetchCategories(); // Always fetch after delete
        } catch (e: any) {
            setModalContent({
                title: 'Error',
                message: e.message || 'Failed to delete category',
                onClose: () => setModalContent({ title: '', message: '', onClose: undefined }),
            });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.text }]}>Categories</Text>
                <Button
                    title="Add"
                    onPress={() => setModalVisible(true)}
                    style={styles.addButton}
                />
            </View>

            <FlatList
                data={categoriesList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.categoryRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.categoryText, { color: theme.text }]}>
                                {item.icon} {item.name}
                                <Text style={{ color: theme.textSecondary }}> ({item.type})</Text>
                            </Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                                Color: <Text style={{ color: item.color }}>{item.color}</Text>
                                {item.is_default ? ' | Default' : ''}
                            </Text>
                        </View>
                        {!item.is_default && (
                            <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                                <Text style={[styles.deleteText, { color: theme.error || 'red' }]}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListEmptyComponent={<Text style={{ color: theme.textSecondary }}>No categories.</Text>}
                refreshing={loading}
                onRefresh={fetchCategories}
                style={{ flex: 1 }}
            />

            {/* Modal for creating category */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Create Category</Text>
                        <Input
                            value={formData.name}
                            onChangeText={text => setFormData(f => ({ ...f, name: text }))}
                            placeholder="Name"
                            error={errors.name}
                            style={styles.input}
                            showLabel={false}
                        />
                        <Input
                            value={formData.icon}
                            onChangeText={text => setFormData(f => ({ ...f, icon: text }))}
                            placeholder="Icon"
                            error={errors.icon}
                            style={styles.input}
                            showLabel={false}
                        />
                        <Input
                            value={formData.color}
                            onChangeText={text => setFormData(f => ({ ...f, color: text }))}
                            placeholder="Color"
                            error={errors.color}
                            style={styles.input}
                            showLabel={false}
                        />
                        <View style={styles.typeRow}>
                            {CATEGORY_TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.typeButton,
                                        {
                                            backgroundColor: formData.type === t ? theme.primary : theme.surface,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                    onPress={() => setFormData(f => ({ ...f, type: t as 'expense' | 'income' | 'both' }))}
                                >
                                    <Text style={{ color: formData.type === t ? '#fff' : theme.text }}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalActionButton, { backgroundColor: theme.primary }]}
                                onPress={handleAddCategory}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalActionButton, { backgroundColor: theme.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal for feedback messages */}
            <ModalMessage
                visible={!!modalContent.title}
                title={modalContent.title}
                message={modalContent.message}
                onClose={() => {
                    setModalContent({ title: '', message: '', onClose: undefined });
                    modalContent.onClose && modalContent.onClose();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        justifyContent: 'space-between',
    },
    title: { ...typography.h2 },
    addButton: { paddingHorizontal: 12, paddingVertical: 6 },
    categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    categoryText: { fontSize: 16 },
    deleteText: { marginLeft: 8, fontWeight: 'bold' },
    input: { marginBottom: 12 },
    typeRow: { flexDirection: 'row', marginBottom: 12 },
    typeButton: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 320,
        borderRadius: borderRadius.lg || 16,
        padding: spacing.lg,
        alignItems: 'stretch',
        elevation: 5,
    },
    modalTitle: {
        ...typography.h2,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    modalActionButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginHorizontal: 4,
    },
});
