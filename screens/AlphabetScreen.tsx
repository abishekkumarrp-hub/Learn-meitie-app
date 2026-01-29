import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { iyekIpee, chetnaIyek, lonsumIyek, AlphabetLetter } from "@/data/alphabet";
import { speak, stopSpeaking } from "@/lib/speech";
import { addAlphabetViewed } from "@/lib/storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_MARGIN = Spacing.sm;
const CARDS_PER_ROW = 3;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_MARGIN * (CARDS_PER_ROW - 1)) / CARDS_PER_ROW;

const CATEGORIES = ["Iyek Ipee", "Chetna Iyek", "Lonsum Iyek"];

const getCategoryData = (index: number): AlphabetLetter[] => {
  switch (index) {
    case 0:
      return iyekIpee;
    case 1:
      return chetnaIyek;
    case 2:
      return lonsumIyek;
    default:
      return iyekIpee;
  }
};

interface LetterCardProps {
  letter: AlphabetLetter;
  index: number;
  theme: any;
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
}

function LetterCard({ letter, index, theme, onSpeakStart, onSpeakEnd }: LetterCardProps) {
  const handlePress = useCallback(async () => {
    onSpeakStart();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addAlphabetViewed(letter.character);
    await speak(letter.roman);
    onSpeakEnd();
  }, [letter, onSpeakStart, onSpeakEnd]);

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 30)}>
      <Pressable
        style={({ pressed }) => [
          styles.letterCard,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={handlePress}
        testID={`card-letter-${index}`}
      >
        <ThemedText style={styles.letterCharacter}>
          {letter.character}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {letter.roman}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export default function AlphabetScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { hideAdBanner, checkAndShowAd } = useAdBanner();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const letters = getCategoryData(selectedIndex);

  useFocusEffect(
    useCallback(() => {
      checkAndShowAd();
      return () => {
        stopSpeaking();
      };
    }, [checkAndShowAd])
  );

  const handleSpeakStart = useCallback(() => {
    hideAdBanner();
  }, [hideAdBanner]);

  const handleSpeakEnd = useCallback(() => {
    checkAndShowAd();
  }, [checkAndShowAd]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.segmentContainer,
          {
            paddingTop: headerHeight + Spacing.md,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <SegmentedControl
          values={CATEGORIES}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          style={styles.segmentControl}
          tintColor={Colors.light.primary}
          fontStyle={{ color: theme.text, fontSize: 13 }}
          activeFontStyle={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}
          backgroundColor={isDark ? theme.backgroundSecondary : theme.backgroundDefault}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.gridContainer,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {letters.map((letter, index) => (
          <LetterCard
            key={`${selectedIndex}-${letter.character}`}
            letter={letter}
            index={index}
            theme={theme}
            onSpeakStart={handleSpeakStart}
            onSpeakEnd={handleSpeakEnd}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  segmentControl: {
    height: 36,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: CARD_MARGIN,
  },
  letterCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  letterCharacter: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
});
