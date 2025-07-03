import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Moon,
  Settings,
  Shield,
  Sun,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/atoms/Button';
import { Card } from '../../components/atoms/Card';
import { borderRadius, darkTheme, lightTheme, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = () => {
    setModalVisible(true);
  };

  const confirmSignOut = async () => {
    setModalVisible(false);
    await signOut();
  };

  // Category state for demo purposes
  const [categories, setCategories] = useState<string[]>(['Food', 'Transport', 'Shopping']);
  const [newCategory, setNewCategory] = useState('');

  const menuItems = [
    {
      icon: Settings,
      title: 'Account Settings',
      subtitle: 'Manage your account preferences',
      onPress: () => { },
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Configure notification settings',
      onPress: () => router.push('/(profile)/notifications'),
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: () => { },
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => { },
    },
    {
      icon: Settings,
      title: 'Manage Categories',
      subtitle: 'Create or delete categories',
      onPress: () => router.push('/(profile)/categories'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sign Out Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sign Out</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to sign out?
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={confirmSignOut}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign Out</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card padding="lg" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.text }]}>
                {user?.full_name || 'User'}
              </Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </Card>

        {/* Theme Toggle */}
        <Card padding="md" style={styles.themeCard}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <View style={styles.themeLeft}>
              {isDark ? (
                <Moon size={20} color={theme.text} />
              ) : (
                <Sun size={20} color={theme.text} />
              )}
              <Text style={[styles.themeText, { color: theme.text }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: isDark ? theme.primary : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: isDark ? 20 : 2 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Card key={index} padding="md" style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.surface }]}>
                    <item.icon size={20} color={theme.textSecondary} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Category Management Inline (optional, can be removed if using CategoriesScreen) */}
        {/* 
        <Card padding="md" style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Categories</Text>
          {categories.map((cat, idx) => (
            <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              <Text style={{ flex: 1, color: theme.text }}>{cat}</Text>
              <TouchableOpacity onPress={() => setCategories(categories.filter((c, i) => i !== idx))}>
                <Text style={{ color: 'red', marginLeft: 8 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput
              style={{
                flex: 1,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 8,
                color: theme.text,
                backgroundColor: theme.surface,
              }}
              placeholder="New category"
              placeholderTextColor={theme.textMuted}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity
              style={{
                marginLeft: 8,
                backgroundColor: theme.primary,
                borderRadius: 8,
                padding: 8,
                justifyContent: 'center',
              }}
              onPress={() => {
                if (newCategory.trim()) {
                  setCategories([...categories, newCategory.trim()]);
                  setNewCategory('');
                }
              }}
            >
              <Text style={{ color: '#fff' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </Card>
        */}

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            fullWidth
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: theme.textMuted }]}>
            Finance Manager v1.0.0
          </Text>
        </View>
      </ScrollView>
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
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
  },
  themeCard: {
    marginBottom: spacing.lg,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    ...typography.body,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  menuCard: {
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...typography.bodySmall,
  },
  signOutSection: {
    marginBottom: spacing.lg,
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    ...typography.caption,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    borderRadius: borderRadius.lg || 16,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
});