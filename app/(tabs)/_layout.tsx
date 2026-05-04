import { TopTabs } from "@/components/ui/MaterialTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps): React.ReactNode {
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

        // eslint-disable-next-line
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  return (
    <View style={styles.root}>
      <TopTabs
        tabBarPosition="bottom"
        screenOptions={{
          sceneStyle: {
            backgroundColor: themeColors.background,
          },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <TopTabs.Screen
          name="index"
          options={{
            title: "SkyTimes",
            tabBarIcon: ({ color }) => (
              <AntDesign name="clock-circle" size={24} color={color} />
            ),
          }}
        />

        <TopTabs.Screen
          name="quests"
          options={{
            title: "Quests",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/images/quest_icon.svg")}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 10,
                  tintColor: color,
                }}
              />
            ),
          }}
        />

        <TopTabs.Screen
          name="shards"
          options={{
            title: "Shards",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/images/shards_icon.svg")}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  tintColor: color,
                }}
              />
            ),
          }}
        />

        <TopTabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="cog-outline" size={24} color={color} />
            ),
          }}
        />
      </TopTabs>

      <View pointerEvents="box-none" style={styles.fabWrapper}>
        <Pressable
          onPress={() => router.push("/archive/seasons")}
          style={({ pressed }) => [
            styles.vaultButton,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
            pressed && styles.vaultButtonPressed,
          ]}
        >
          <Ionicons
            name="archive-outline"
            size={18}
            color={themeColors.tint}
            style={styles.vaultIcon}
          />
          <Text style={[styles.vaultText, { color: themeColors.text }]}>
            Vault Archive
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fabWrapper: {
    position: "absolute",
    right: 10,
    bottom: 100,
    alignItems: "center",
  },
  vaultButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  vaultButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  vaultIcon: {
    marginRight: 8,
  },
  vaultText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
