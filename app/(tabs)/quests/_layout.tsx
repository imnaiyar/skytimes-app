import { TopTabs } from "@/components/ui/MaterialTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";

export default function QuestsLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <TopTabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderBottomColor: themeColors.border,
          borderBottomWidth: 1,
        },
        tabBarIndicatorStyle: {
          backgroundColor: themeColors.tint,
          height: 5,
          width: "50%",
          marginBottom: 4,
          borderRadius: 12,
          alignSelf: "center",
          marginHorizontal: "auto",
        },
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.tabIconDefault,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "capitalize",
        },
      }}
    >
      <TopTabs.Screen
        name="index"
        options={{
          title: "Quests",
        }}
      />
      <TopTabs.Screen
        name="candles"
        options={{
          title: "Daily Candles",
        }}
      />
    </TopTabs>
  );
}
