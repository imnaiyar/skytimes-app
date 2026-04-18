import { View } from "@/components/Themed";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useReorderMode } from "@/utils/hooks";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Entypo from '@expo/vector-icons/Entypo';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
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
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
        },
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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: reorder ? "Re-ordering..." : "SkyTimes",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <View style={{ gap: 4, flexDirection: "row", alignItems: "center", backgroundColor: "transparent" }}>
              {process.env.NODE_ENV === "development" && (<Link href="/widget_preview" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Entypo name="popup" size={24} size={25}
                      color={themeColors.text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }} />
                  )}
                </Pressable>
              </Link>)}
              
              {!reorder && (<Link href="/instruction" asChild>
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
              </Link>)}
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
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cog-outline" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="widget_preview"
        options={{
          title: "Widget",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cog-outline" size={24} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
