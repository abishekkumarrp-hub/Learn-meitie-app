import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { setUserName, incrementSessionCount } from "@/lib/storage";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (name.trim().length === 0) return;

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setUserName(name.trim());
    await incrementSessionCount();
    setIsLoading(false);
    onComplete();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <Image
            source={require("../../assets/images/welcome-onboarding.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.textContainer}>
          <ThemedText type="h1" style={styles.title}>
            Welcome to Learn Meitei
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Start your journey to learn Manipuri language
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(500)} style={styles.inputContainer}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            What should we call you?
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            testID="input-name"
          />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.duration(600).delay(700)}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: name.trim().length > 0 ? Colors.light.primary : theme.disabled,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleStart}
          disabled={name.trim().length === 0 || isLoading}
          testID="button-start"
        >
          <ThemedText type="body" style={styles.buttonText}>
            Start Learning
          </ThemedText>
        </Pressable>
        <ThemedText type="small" style={[styles.note, { color: theme.textSecondary }]}>
          Your progress is saved on this device
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: Spacing["2xl"],
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  note: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
