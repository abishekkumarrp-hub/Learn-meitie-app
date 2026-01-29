import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LearnScreen from "@/screens/LearnScreen";
import AlphabetScreen from "@/screens/AlphabetScreen";
import LevelsScreen from "@/screens/LevelsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MainTabParamList = {
  LearnTab: undefined;
  AlphabetTab: undefined;
  LevelsTab: undefined;
  SettingsTab: undefined;
};

export type LearnStackParamList = {
  LearnMain: undefined;
};

export type AlphabetStackParamList = {
  AlphabetMain: undefined;
};

export type LevelsStackParamList = {
  LevelsMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const LearnStack = createNativeStackNavigator<LearnStackParamList>();
const AlphabetStack = createNativeStackNavigator<AlphabetStackParamList>();
const LevelsStack = createNativeStackNavigator<LevelsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function LearnStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <LearnStack.Navigator screenOptions={screenOptions}>
      <LearnStack.Screen
        name="LearnMain"
        component={LearnScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Learn Meitei" />,
        }}
      />
    </LearnStack.Navigator>
  );
}

function AlphabetStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <AlphabetStack.Navigator screenOptions={screenOptions}>
      <AlphabetStack.Screen
        name="AlphabetMain"
        component={AlphabetScreen}
        options={{
          headerTitle: "Alphabet",
        }}
      />
    </AlphabetStack.Navigator>
  );
}

function LevelsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <LevelsStack.Navigator screenOptions={screenOptions}>
      <LevelsStack.Screen
        name="LevelsMain"
        component={LevelsScreen}
        options={{
          headerTitle: "Levels",
        }}
      />
    </LevelsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <SettingsStack.Navigator screenOptions={screenOptions}>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
    </SettingsStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="LearnTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="LearnTab"
        component={LearnStackNavigator}
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AlphabetTab"
        component={AlphabetStackNavigator}
        options={{
          title: "Alphabet",
          tabBarIcon: ({ color, size }) => (
            <Feather name="type" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LevelsTab"
        component={LevelsStackNavigator}
        options={{
          title: "Levels",
          tabBarIcon: ({ color, size }) => (
            <Feather name="layers" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
