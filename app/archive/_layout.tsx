import { TopTabs } from "@/components/ui/MaterialTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";
import { View } from "react-native";

export default function ArchiveLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <View style={{ flex: 1 }}>
      <TopTabs
        tabBarPosition="top"
        screenOptions={{
          swipeEnabled: true,
          tabBarScrollEnabled: true,
          tabBarStyle: {
            backgroundColor: themeColors.card,
            borderBottomColor: themeColors.border,
            borderBottomWidth: 1,
          },
          tabBarIndicatorStyle: {
            backgroundColor: themeColors.tint,
            height: 4,
            borderRadius: 12,
            marginBottom: 4,
          },
          tabBarActiveTintColor: themeColors.tint,
          tabBarInactiveTintColor: themeColors.tabIconDefault,
          tabBarItemStyle: {
            width: 140,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            textTransform: "capitalize",
          },
        }}
      >
        <TopTabs.Screen
          name="seasons"
          options={{
            title: "Season",
          }}
        />
      </TopTabs>
    </View>
  );
}
