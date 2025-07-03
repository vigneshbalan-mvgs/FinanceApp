import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { darkTheme, lightTheme, spacing, typography } from "../../constants/theme";
import { useThemeStore } from "../../stores/themeStore";

type ModalMessageProps = {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
};

export function ModalMessage({
    visible,
    title,
    message,
    onClose,
    buttonText = "OK",
}: ModalMessageProps) {
    const { isDark } = useThemeStore();
    const theme = isDark ? darkTheme : lightTheme;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{message}</Text>
                    <Pressable
                        style={[styles.modalButton, { backgroundColor: theme.primary }]}
                        onPress={onClose}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{buttonText}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: 300,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: "center",
        elevation: 5,
    },
    modalTitle: {
        ...typography.h2,
        marginBottom: spacing.md,
        textAlign: "center",
    },
    modalMessage: {
        ...typography.body,
        marginBottom: spacing.lg,
        textAlign: "center",
    },
    modalButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 8,
        alignItems: "center",
    },
});
