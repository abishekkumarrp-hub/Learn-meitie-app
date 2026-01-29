import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getProgress, getQuizScore } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LevelCardProps {
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  score?: number | null;
  onPress: () => void;
  theme: any;
  index: number;
}

function LevelCard({
  title,
  description,
  isLocked,
  isCompleted,
  score,
  onPress,
  theme,
  index,
}: LevelCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
      <Pressable
        style={({ pressed }) => [
          styles.levelCard,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed && !isLocked ? 0.8 : 1,
          },
        ]}
        onPress={isLocked ? undefined : onPress}
        disabled={isLocked}
        testID={`card-level-${title.toLowerCase()}`}
      >
        <View style={styles.levelContent}>
          <View style={styles.levelHeader}>
            <ThemedText type="h4" style={isLocked ? { color: theme.disabled } : undefined}>
              {title}
            </ThemedText>
            {isCompleted ? (
              <View style={[styles.badge, { backgroundColor: Colors.light.success }]}>
                <Feather name="check" size={14} color="#FFFFFF" />
              </View>
            ) : isLocked ? (
              <Feather name="lock" size={18} color={theme.disabled} />
            ) : null}
          </View>
          <ThemedText
            type="small"
            style={{ color: isLocked ? theme.disabled : theme.textSecondary }}
          >
            {description}
          </ThemedText>
          {score !== null && score !== undefined ? (
            <ThemedText type="small" style={[styles.scoreText, { color: Colors.light.success }]}>
              Best Score: {score}/10
            </ThemedText>
          ) : null}
        </View>

        {isLocked ? (
          <Image
            source={require("../../assets/images/locked-level.png")}
            style={styles.lockedImage}
            resizeMode="contain"
          />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              {
                backgroundColor: Colors.light.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={onPress}
            testID={`button-start-${title.toLowerCase()}`}
          >
            <ThemedText type="small" style={styles.startButtonText}>
              {isCompleted ? "Retake Quiz" : "Start Quiz"}
            </ThemedText>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { showAdBanner } = useAdBanner();

  const [progress, setProgress] = useState({
    wordsLearned: 0,
    alphabetViewed: 0,
    quizCompleted: false,
  });
  const [beginnerScore, setBeginnerScore] = useState<number | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  useFocusEffect(
    useCallback(() => {
      showAdBanner();
      loadProgress();
    }, [showAdBanner])
  );

  const loadProgress = async () => {
    const [progressData, score] = await Promise.all([
      getProgress(),
      getQuizScore("beginner"),
    ]);
    setProgress(progressData);
    setBeginnerScore(score);
  };

  const handleStartQuiz = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Quiz");
  }, [navigation]);

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
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h4" style={styles.progressTitle}>
            Your Progress
          </ThemedText>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <ThemedText type="h2" style={{ color: Colors.light.primary }}>
                {progress.wordsLearned}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Words Learned
              </ThemedText>
            </View>
            <View style={[styles.progressDivider, { backgroundColor: theme.border }]} />
            <View style={styles.progressStat}>
              <ThemedText type="h2" style={{ color: Colors.light.primary }}>
                {progress.alphabetViewed}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Letters Viewed
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          Levels
        </ThemedText>

        <LevelCard
          title="Beginner"
          description="Learn basic Meitei words and phrases"
          isLocked={false}
          isCompleted={progress.quizCompleted}
          score={beginnerScore}
          onPress={handleStartQuiz}
          theme={theme}
          index={0}
        />

        <LevelCard
          title="Intermediate"
          description="Expand your vocabulary with more complex words"
          isLocked={true}
          isCompleted={false}
          onPress={() => {}}
          theme={theme}
          index={1}
        />

        <LevelCard
          title="Advanced"
          description="Master Manipuri with advanced expressions"
          isLocked={true}
          isCompleted={false}
          onPress={() => {}}
          theme={theme}
          index={2}
        />

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
  progressCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    marginBottom: Spacing.lg,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStat: {
    flex: 1,
    alignItems: "center",
  },
  progressDivider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  levelContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    marginTop: Spacing.xs,
  },
  lockedImage: {
    width: 50,
    height: 50,
    opacity: 0.5,
  },
  startButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  adPlaceholder: {
    height: 50,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
