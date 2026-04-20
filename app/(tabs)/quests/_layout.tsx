import { Header } from "@/components/ui/Header";
import { TopTabs } from "@/components/ui/MaterialTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ToastAndroid, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function QuestsLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <View style={{ flex: 1 }}>
      <Header title="Quests" right={<AnimatedRefreshButton />} />
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
    </View>
  );
}

function AnimatedRefreshButton() {
  const themeColors = Colors[useColorScheme() ?? "light"];
  const rotation = useSharedValue(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const refreshStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const { fetchQuests } = useDailyQuestsStore();
  const handleRefreshPress = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    rotation.value = 0;
    rotation.value = withRepeat(withTiming(360, { duration: 600 }), 1, false);
    fetchQuests().then(() => {
      setIsAnimating(false);
      ToastAndroid.show("Refetched Quests", ToastAndroid.SHORT);
    });
  };

  return (
    <Pressable onPress={handleRefreshPress} disabled={isAnimating}>
      <Animated.View style={refreshStyle}>
        <Ionicons
          name="refresh"
          size={20}
          color={isAnimating ? themeColors.mutedText : themeColors.text}
          style={{ opacity: isAnimating ? 0.6 : 1 }}
        />
      </Animated.View>
    </Pressable>
  );
}
