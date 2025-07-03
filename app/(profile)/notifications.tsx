import { borderRadius, darkTheme, lightTheme, spacing, typography } from '@/constants/theme';
import { useThemeStore } from '@/stores/themeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const { isDark } = useThemeStore();
    const theme = isDark ? darkTheme : lightTheme;

    const [time, setTime] = useState(new Date(new Date().setHours(21, 0, 0, 0))); // Default 9pm
    const [showPicker, setShowPicker] = useState(false);
    const [scheduled, setScheduled] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [silentDaily, setSilentDaily] = useState(false);
    const [silentTest, setSilentTest] = useState(false);
    const [notificationId, setNotificationId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                // Load stored settings
                const stored = await AsyncStorage.getItem('dailyNotification');
                if (stored) {
                    const { enabled, hour, minute, id } = JSON.parse(stored);
                    setScheduled(enabled);
                    if (id) setNotificationId(id);
                    if (typeof hour === 'number' && typeof minute === 'number') {
                        setTime(new Date(new Date().setHours(hour, minute, 0, 0)));
                    }
                }

                // Get push permissions
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                // Get Expo Push Token
                if (finalStatus === 'granted') {
                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    setExpoPushToken(tokenData.data);
                    if (__DEV__) console.log('Expo Push Token:', tokenData.data);
                }

                // Setup notification handler (platform-aware)
                Notifications.setNotificationHandler({
                    handleNotification: async () => {
                        if (Platform.OS === 'ios') {
                            return {
                                shouldShowBanner: true,
                                shouldShowList: true,
                                shouldPlaySound: true,
                                shouldSetBadge: false,
                            };
                        } else {
                            return {
                                shouldShowAlert: true,
                                shouldPlaySound: true,
                                shouldSetBadge: false,
                            };
                        }
                    },
                });
            } catch (err) {
                console.error('Init error:', err);
            }
        })();
    }, []);

    useEffect(() => {
        if (__DEV__) {
            console.log('Silent Daily:', silentDaily, 'Silent Test:', silentTest, 'Scheduled:', scheduled, 'Time:', time);
        }
    }, [silentDaily, silentTest, scheduled, time]);

    const persistNotificationSettings = async (
        enabled: boolean,
        hour: number,
        minute: number,
        id: string | null
    ) => {
        await AsyncStorage.setItem(
            'dailyNotification',
            JSON.stringify({ enabled, hour, minute, id })
        );
    };

    const scheduleNotification = async () => {
        try {
            if (__DEV__) console.log('Scheduling daily notification at', time.toLocaleTimeString(), 'Silent:', silentDaily);
            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            }

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Daily Report",
                    body: "Check your daily finance report!",
                    sound: silentDaily ? null : 'default',
                },
                trigger: {
                    hour: time.getHours(),
                    minute: time.getMinutes(),
                    repeats: true,
                },
            });

            setScheduled(true);
            setNotificationId(id);
            await persistNotificationSettings(true, time.getHours(), time.getMinutes(), id);

            if (__DEV__) console.log('Daily notification scheduled with ID:', id);
        } catch (err) {
            console.error('Failed to schedule notification:', err);
        }
    };

    const cancelNotification = async () => {
        try {
            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            } else {
                await Notifications.cancelAllScheduledNotificationsAsync(); // fallback
            }
            setScheduled(false);
            setNotificationId(null);
            await persistNotificationSettings(false, time.getHours(), time.getMinutes(), null);
            if (__DEV__) console.log('Daily notification canceled');
        } catch (err) {
            console.error('Failed to cancel notification:', err);
        }
    };

    const sendTestNotification = async (title: string, body: string) => {
        try {
            if (__DEV__) console.log('Sending test notification:', title, body, 'Silent:', silentTest);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: silentTest ? null : 'default',
                },
                trigger: null,
            });
        } catch (err) {
            console.error('Failed to send test notification:', err);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>

            <View style={styles.section}>
                <Text style={[styles.label, { color: theme.text }]}>Daily notification time:</Text>
                <View style={{ borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.sm }}>
                    <Button
                        title={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        color={theme.primary}
                        onPress={() => setShowPicker(true)}
                    />
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selected) => {
                            setShowPicker(false);
                            if (event.type === 'set' && selected) {
                                setTime(selected);
                                if (scheduled) {
                                    scheduleNotification();
                                }
                            }
                        }}
                    />
                )}
            </View>

            <View style={styles.section}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                    <Text style={{ color: theme.text, marginRight: 8 }}>Silent Daily Notification</Text>
                    <Button
                        title={silentDaily ? "On" : "Off"}
                        color={silentDaily ? theme.primary : theme.border}
                        onPress={() => setSilentDaily(prev => !prev)}
                    />
                </View>

                <View style={{ borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.sm }}>
                    <Button
                        title="Check Daily Reminder"
                        color={theme.primary}
                        onPress={() =>
                            sendTestNotification("Daily Reminder", "This is your daily reminder notification!")
                        }
                    />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                    <Text style={{ color: theme.text, marginRight: 8 }}>Silent Test Notification</Text>
                    <Button
                        title={silentTest ? "On" : "Off"}
                        color={silentTest ? theme.primary : theme.border}
                        onPress={() => setSilentTest(prev => !prev)}
                    />
                </View>

                <View style={{ borderRadius: borderRadius.md, overflow: 'hidden' }}>
                    <Button
                        title={scheduled ? "Cancel Daily Notification" : "Enable Daily Notification"}
                        color={scheduled ? theme.error : theme.primary}
                        onPress={scheduled ? cancelNotification : scheduleNotification}
                    />
                </View>
            </View>

            <View style={{ marginTop: spacing.lg }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Expo Push Token (for remote push):{'\n'}
                    {expoPushToken || 'Not available'}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg },
    title: { ...typography.h2, marginBottom: spacing.md },
    section: { marginBottom: spacing.lg },
    label: { ...typography.body, marginBottom: spacing.sm },
});
