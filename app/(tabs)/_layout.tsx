import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useReorderMode } from "@/utils/hooks";
import { useDailyQuestsStore } from "@/utils/quests";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Link, Tabs } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, ToastAndroid, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.ReactNode {
  const themeCOlor = Colors[useColorScheme() ?? "light"];
  const [pressedRoute, setPressedRoute] = React.useState<string | null>(null);
  const pressScale = useSharedValue(1);

  React.useEffect(() => {
    if (pressedRoute) {
      pressScale.value = withTiming(1.2, { duration: 150 }, () => {
        pressScale.value = withTiming(1, { duration: 150 });
      });
    }
  }, [pressedRoute]);

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: themeCOlor.card,
        position: "relative",
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const isPressed = pressedRoute === route.key;

        const pressStyle = useAnimatedStyle(() => ({
          transform: [{ scaleX: isPressed ? pressScale.value : 1 }],
        }));

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              setPressedRoute(route.key);
              setTimeout(() => setPressedRoute(null), 300);

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 35,
                    width: 50,
                    zIndex: 2,
                    borderRadius: 12,
                    backgroundColor: focused
                      ? themeCOlor.tint + "15"
                      : "transparent",
                  },
                  pressStyle,
                ]}
              />

              <View
                style={{
                  height: 30,
                  width: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {options.tabBarIcon?.({
                  focused,
                  color: focused ? themeCOlor.tint : themeCOlor.tabIconDefault,
                  size: 24,
                })}
              </View>
            </View>
            <Text
              style={{
                marginTop: 4,
                fontSize: 11,
                color: focused ? themeCOlor.tint : themeCOlor.tabIconDefault,
                fontWeight: focused ? "700" : "500",
              }}
            >
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
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
    <Pressable
      style={{ margin: 15 }}
      onPress={handleRefreshPress}
      disabled={isAnimating}
    >
      <Animated.View style={refreshStyle}>
        <Ionicons
          name="refresh"
          size={24}
          color={isAnimating ? themeColors.mutedText : themeColors.text}
          style={{ opacity: isAnimating ? 0.6 : 1 }}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const rotation = useSharedValue(0);
  const { reorder, setReorder } = useReorderMode();

  const reorderStyle = useAnimatedStyle(() => ({
    opacity: 1 - rotation.value,
    transform: [
      { rotate: `${rotation.value * 90}deg` },
      { scale: 1 - 0.3 * rotation.value },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: rotation.value,
    transform: [
      { rotate: `${-90 + rotation.value * 90}deg` },
      { scale: 0.7 + 0.3 * rotation.value },
    ],
  }));

  const toggle = () => {
    setReorder(!reorder);
    rotation.value = withTiming(rotation.value === 1 ? 0 : 1, {
      duration: 200,
    });
  };
  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: themeColors.background,
        },
        headerStyle: {
          backgroundColor: themeColors.card,
        },

        headerTintColor: themeColors.text,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: reorder ? "Re-ordering..." : "SkyTimes",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" size={size} color={color} />
          ),
          headerRight: () => (
            <View
              style={{
                gap: 4,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "transparent",
              }}
            >
              {process.env.NODE_ENV === "development" && (
                <Link href="/widget_preview" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <Entypo
                        name="popup"
                        size={25}
                        color={themeColors.text}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              )}

              {!reorder && (
                <Link href="/instruction" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <FontAwesome
                        name="info-circle"
                        size={25}
                        color={themeColors.text}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              )}
              <Pressable onPress={toggle}>
                <Animated.View>
                  <Animated.View
                    style={[{ position: "relative" }, reorderStyle]}
                  >
                    <FontAwesome6
                      name="arrow-down-wide-short"
                      size={25}
                      color={themeColors.text}
                      style={{ marginRight: 15 }}
                    />
                  </Animated.View>

                  <Animated.View style={[{ position: "absolute" }, checkStyle]}>
                    <Ionicons
                      name="checkmark"
                      size={25}
                      color={themeColors.text}
                      style={{ marginRight: 15 }}
                    />
                  </Animated.View>
                </Animated.View>
              </Pressable>
            </View>
          ),
        }}
      />

      {
        <Tabs.Screen
          name="quests"
          options={{
            title: "Quests",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("@/assets/images/quest_icon.svg")}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 10,
                  tintColor: color,
                }}
              />
            ),
            headerRight: () => <AnimatedRefreshButton />,
            headerStyle: { borderBottomWidth: 0, elevation: 0 },
          }}
        />
      }
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
