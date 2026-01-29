import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getUserName,
  setUserName,
  clearAllProgress,
  getProgress,
} from "@/lib/storage";

const APP_VERSION = "1.0.0";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { showAdBanner } = useAdBanner();

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [progress, setProgress] = useState({
    wordsLearned: 0,
    alphabetViewed: 0,
    quizCompleted: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      showAdBanner();
    }, [showAdBanner])
  );

  const loadData = async () => {
    const [userName, progressData] = await Promise.all([
      getUserName(),
      getProgress(),
    ]);
    if (userName) {
      setName(userName);
      setOriginalName(userName);
    }
    setProgress(progressData);
  };

  const handleNameChange = useCallback(async () => {
    if (name.trim() !== originalName && name.trim().length > 0) {
      await setUserName(name.trim());
      setOriginalName(name.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [name, originalName]);

  const handleClearProgress = useCallback(() => {
    const showAlert = () => {
      Alert.alert(
        "Clear Progress",
        "This will reset all your learning progress. This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: async () => {
              await clearAllProgress();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              loadData();
            },
          },
        ]
      );
    };

    showAlert();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Your Name
          </ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              onBlur={handleNameChange}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              testID="input-settings-name"
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Your Progress
          </ThemedText>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Feather name="book-open" size={20} color={Colors.light.primary} />
              <ThemedText type="body">
                {progress.wordsLearned} words learned
              </ThemedText>
            </View>
            <View style={styles.progressItem}>
              <Feather name="type" size={20} color={Colors.light.primary} />
              <ThemedText type="body">
                {progress.alphabetViewed} letters viewed
              </ThemedText>
            </View>
            <View style={styles.progressItem}>
              <Feather
                name={progress.quizCompleted ? "check-circle" : "circle"}
                size={20}
                color={progress.quizCompleted ? Colors.light.success : theme.textSecondary}
              />
              <ThemedText type="body">
                Quiz {progress.quizCompleted ? "completed" : "not completed"}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <Pressable
            style={({ pressed }) => [
              styles.dangerButton,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: Colors.light.error,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleClearProgress}
            testID="button-clear-progress"
          >
            <Feather name="trash-2" size={18} color={Colors.light.error} />
            <ThemedText type="body" style={{ color: Colors.light.error }}>
              Clear All Progress
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.infoRow}>
            <ThemedText type="body">App Version</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {APP_VERSION}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <View style={styles.privacyNote}>
            <Feather name="shield" size={18} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
              All your data is stored locally on this device. No internet connection is required, and we do not collect any personal information.
            </ThemedText>
          </View>
        </Animated.View>

        <View style={[styles.adPlaceholder, { backgroundColor: theme.adPlaceholder }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Ad
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  progressRow: {
    gap: Spacing.md,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  adPlaceholder: {
    height: 50,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
});
