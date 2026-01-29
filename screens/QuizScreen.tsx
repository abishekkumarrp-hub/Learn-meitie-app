import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { beginnerWords, Word } from "@/data/words";
import {
  setQuizCompleted,
  isReviewShown,
  setReviewShown,
  getSessionCount,
} from "@/lib/storage";

const QUIZ_LENGTH = Math.min(10, beginnerWords.length);

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateOptions(correctWord: Word, allWords: Word[]): string[] {
  const otherWords = allWords.filter((w) => w.id !== correctWord.id);
  const wrongOptions = shuffleArray(otherWords)
    .slice(0, 2)
    .map((w) => w.english);
  const options = shuffleArray([correctWord.english, ...wrongOptions]);
  return options;
}

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { hideAdBanner, showAdBanner } = useAdBanner();

  const quizWords = useMemo(() => shuffleArray(beginnerWords).slice(0, QUIZ_LENGTH), []);

  useFocusEffect(
    useCallback(() => {
      hideAdBanner();
      return () => {};
    }, [hideAdBanner])
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const currentWord = quizWords[currentQuestion];
  const options = useMemo(
    () => generateOptions(currentWord, beginnerWords),
    [currentWord]
  );

  const cardScale = useSharedValue(1);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentWord.english;
      setIsCorrect(correct);

      if (correct) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore((s) => s + 1);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        cardScale.value = withSequence(
          withTiming(1.02, { duration: 50 }),
          withTiming(0.98, { duration: 50 }),
          withTiming(1.01, { duration: 50 }),
          withTiming(1, { duration: 50 })
        );
      }

      setTimeout(() => {
        if (currentQuestion + 1 >= QUIZ_LENGTH) {
          handleQuizComplete();
        } else {
          setCurrentQuestion((q) => q + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
        }
      }, 1000);
    },
    [selectedAnswer, currentWord, currentQuestion, cardScale]
  );

  const handleQuizComplete = async () => {
    const finalScore = score + (isCorrect ? 1 : 0);
    await setQuizCompleted("beginner", finalScore);
    setIsComplete(true);
    showAdBanner();

    const [reviewed, sessionCount] = await Promise.all([
      isReviewShown(),
      getSessionCount(),
    ]);

    if (!reviewed && sessionCount >= 5) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 500);
    }
  };

  const handleDone = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  const handleReviewLater = async () => {
    setShowReviewModal(false);
  };

  const handleRateApp = async () => {
    await setReviewShown();
    setShowReviewModal(false);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (isComplete) {
    const finalScore = score;
    return (
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: headerHeight + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.completeContainer}>
          <Animated.View entering={FadeIn.duration(600)}>
            <View style={[styles.completeBadge, { backgroundColor: Colors.light.success }]}>
              <Feather name="award" size={48} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <ThemedText type="h1" style={styles.completeTitle}>
              Quiz Complete!
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <ThemedText type="h2" style={[styles.scoreDisplay, { color: Colors.light.primary }]}>
              {finalScore} / {QUIZ_LENGTH}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {finalScore >= 8
                ? "Excellent work!"
                : finalScore >= 5
                ? "Good job! Keep practicing!"
                : "Keep learning, you'll improve!"}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(600)}>
            <Pressable
              style={({ pressed }) => [
                styles.doneButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleDone}
              testID="button-done"
            >
              <ThemedText type="body" style={styles.doneButtonText}>
                Done
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>

        <Modal
          visible={showReviewModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="h3" style={styles.modalTitle}>
                Enjoying Learn Meitei?
              </ThemedText>
              <ThemedText type="body" style={[styles.modalMessage, { color: theme.textSecondary }]}>
                Your feedback helps us improve!
              </ThemedText>
              <View style={styles.modalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalSecondaryButton,
                    { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleReviewLater}
                >
                  <ThemedText type="body">Not Now</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    { backgroundColor: Colors.light.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={handleRateApp}
                >
                  <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                    Rate App
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Question {currentQuestion + 1} of {QUIZ_LENGTH}
        </ThemedText>
        <View style={[styles.scoreBadge, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small">
            Score: {score}/{currentQuestion}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: Colors.light.primary,
              width: `${((currentQuestion + 1) / QUIZ_LENGTH) * 100}%`,
            },
          ]}
        />
      </View>

      <Animated.View style={[styles.questionContainer, cardAnimatedStyle]}>
        <Animated.View
          key={currentQuestion}
          entering={SlideInRight.duration(300)}
        >
          <ThemedText style={styles.questionWord}>
            {currentWord.meitei}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.questionHint, { color: theme.textSecondary }]}>
            {currentWord.roman}
          </ThemedText>
        </Animated.View>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentWord.english;
          const showResult = selectedAnswer !== null;

          let backgroundColor = theme.backgroundDefault;
          let borderColor = theme.border;

          if (showResult) {
            if (isCorrectOption) {
              backgroundColor = Colors.light.success;
              borderColor = Colors.light.success;
            } else if (isSelected && !isCorrectOption) {
              backgroundColor = Colors.light.error;
              borderColor = Colors.light.error;
            }
          }

          return (
            <Animated.View
              key={`${currentQuestion}-${option}`}
              entering={FadeInDown.duration(300).delay(index * 100)}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor,
                    borderColor,
                    opacity: pressed && !showResult ? 0.8 : 1,
                  },
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                testID={`button-option-${index}`}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: showResult && (isCorrectOption || isSelected) ? "#FFFFFF" : theme.text,
                    fontWeight: "500",
                  }}
                >
                  {option}
                </ThemedText>
                {showResult && isCorrectOption ? (
                  <Feather name="check" size={20} color="#FFFFFF" />
                ) : showResult && isSelected && !isCorrectOption ? (
                  <Feather name="x" size={20} color="#FFFFFF" />
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  questionWord: {
    fontSize: Typography.hero.fontSize,
    lineHeight: Typography.hero.lineHeight,
    fontWeight: Typography.hero.fontWeight,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  questionHint: {
    textAlign: "center",
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  completeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  completeBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  completeTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  scoreDisplay: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  doneButton: {
    paddingHorizontal: Spacing["3xl"],
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalMessage: {
    marginBottom: Spacing["2xl"],
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryButton: {
    borderWidth: 1,
  },
});
