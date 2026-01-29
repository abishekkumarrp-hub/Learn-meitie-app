import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { beginnerWords, Word } from "@/data/words";
import { speak, stopSpeaking } from "@/lib/speech";
import {
  getCurrentWordIndex,
  setCurrentWordIndex,
  addWordLearned,
  getWordsLearned,
} from "@/lib/storage";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { hideAdBanner, checkAndShowAd } = useAdBanner();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cardScale = useSharedValue(1);

  useEffect(() => {
    loadProgress();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAndShowAd();
      return () => {
        stopSpeaking();
      };
    }, [checkAndShowAd])
  );

  const loadProgress = async () => {
    const index = await getCurrentWordIndex();
    if (index >= beginnerWords.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(index);
    }
    setIsLoading(false);
    
    const wordsLearned = await getWordsLearned();
    if (wordsLearned.length >= 3) {
      checkAndShowAd();
    }
  };

  const currentWord: Word | null = beginnerWords[currentIndex] ?? null;

  const handleNext = useCallback(async () => {
    if (!currentWord) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addWordLearned(currentWord.id);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= beginnerWords.length) {
      setIsComplete(true);
      await setCurrentWordIndex(beginnerWords.length);
    } else {
      setCurrentIndex(nextIndex);
      await setCurrentWordIndex(nextIndex);
      cardScale.value = withSpring(1.02, { damping: 10 });
      setTimeout(() => {
        cardScale.value = withSpring(1, { damping: 15 });
      }, 100);
    }
    
    if (nextIndex >= 3) {
      checkAndShowAd();
    }
  }, [currentIndex, currentWord, cardScale, checkAndShowAd]);

  const handleReset = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    setIsComplete(false);
    await setCurrentWordIndex(0);
  }, []);

  const handleListen = useCallback(async () => {
    if (!currentWord || isSpeaking) return;
    setIsSpeaking(true);
    hideAdBanner();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await speak(currentWord.roman);
    setIsSpeaking(false);
    checkAndShowAd();
  }, [currentWord, isSpeaking, hideAdBanner, checkAndShowAd]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeIn.duration(600)}>
            <Image
              source={require("../../assets/images/empty-words.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <ThemedText type="h3" style={styles.emptyTitle}>
              All Words Reviewed!
            </ThemedText>
            <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Great job! You've reviewed all {beginnerWords.length} words.
            </ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(600).delay(400)}>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleReset}
              testID="button-reset-complete"
            >
              <Feather name="refresh-cw" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.resetButtonText}>
                Start Again
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <View style={styles.counterContainer}>
        <View style={[styles.counterBadge, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {currentIndex + 1} / {beginnerWords.length}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
            cardAnimatedStyle,
          ]}
        >
          <ThemedText style={styles.meiteiWord}>
            {currentWord?.meitei}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.romanText, { color: theme.textSecondary }]}>
            {currentWord?.roman}
          </ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="h4" style={styles.englishText}>
            {currentWord?.english}
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryButton,
            {
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleListen}
          testID="button-listen"
        >
          <Feather name="volume-2" size={22} color={Colors.light.primary} />
          <ThemedText type="body" style={[styles.secondaryButtonText, { color: Colors.light.primary }]}>
            Listen
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryButton,
            {
              backgroundColor: Colors.light.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleNext}
          testID="button-next"
        >
          <ThemedText type="body" style={styles.primaryButtonText}>
            Next
          </ThemedText>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryButton,
            {
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleReset}
          testID="button-reset"
        >
          <Feather name="refresh-cw" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Reset
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    alignItems: "flex-end",
    marginBottom: Spacing.lg,
  },
  counterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  meiteiWord: {
    fontSize: Typography.hero.fontSize,
    lineHeight: Typography.hero.lineHeight,
    fontWeight: Typography.hero.fontWeight,
    marginBottom: Spacing.md,
  },
  romanText: {
    marginBottom: Spacing.lg,
  },
  divider: {
    width: 60,
    height: 2,
    marginBottom: Spacing.lg,
    borderRadius: 1,
  },
  englishText: {
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  primaryButton: {
    flex: 1.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: Spacing["2xl"],
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing["2xl"],
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
