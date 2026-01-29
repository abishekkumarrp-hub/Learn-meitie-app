import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAdBanner } from "@/contexts/AdBannerContext";
import { BorderRadius } from "@/constants/theme";

const AD_BANNER_HEIGHT = 56;

interface AdBannerPlaceholderProps {
  hasTabBar?: boolean;
}

export function AdBannerPlaceholder({ hasTabBar = true }: AdBannerPlaceholderProps) {
  const { theme } = useTheme();
  const { isAdVisible } = useAdBanner();
  const insets = useSafeAreaInsets();

  let tabBarHeight = 0;
  try {
    if (hasTabBar) {
      tabBarHeight = useBottomTabBarHeight();
    }
  } catch {
    tabBarHeight = 0;
  }

  if (!isAdVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          bottom: hasTabBar ? tabBarHeight : insets.bottom,
          backgroundColor: "transparent",
        },
      ]}
    >
      <View style={[styles.adContainer, { backgroundColor: theme.adPlaceholder }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Ad
        </ThemedText>
      </View>
    </View>
  );
}

export function getAdBannerHeight(isVisible: boolean): number {
  return isVisible ? AD_BANNER_HEIGHT : 0;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: AD_BANNER_HEIGHT,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  adContainer: {
    width: "100%",
    height: 50,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
});
