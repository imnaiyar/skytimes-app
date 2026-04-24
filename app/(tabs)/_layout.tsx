import { TopTabs } from "@/components/ui/MaterialTabs";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  return (
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
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" size={size} color={color} />
          ),
        }}
      />

      <TopTabs.Screen
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
        }}
      />

      <TopTabs.Screen
        name="shards"
        options={{
          title: "Shards",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/images/shards_icon.svg")}
              style={{
                width: size,
                height: size,
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </TopTabs>
  );
}
