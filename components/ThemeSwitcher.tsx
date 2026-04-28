import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Host, Icon, IconButton } from "@expo/ui/jetpack-compose";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function ThemeSwitcherButton({ onToggle }: { onToggle: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = Colors[colorScheme ?? "light"];

  // Animation values
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset rotation to 0 without animation before each toggle
    rotation.setValue(0);

    Animated.parallel([
      // Spin 360°
      Animated.timing(rotation, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Pop: shrink then grow
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [colorScheme]); // re-runs every time theme changes

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handlePress = () => {
    onToggle();
  };

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin }, { scale }],
      }}
    >
      <Host matchContents>
        <IconButton
          onClick={handlePress}
          colors={{
            containerColor: themeColors.card,
            contentColor: themeColors.tint,
          }}
        >
          <Icon
            size={22}
            source={
              isDark
                ? require("@/assets/icons/theme.xml")
                : require("@/assets/icons/dark_mode_24px.xml")
            }
          ></Icon>
        </IconButton>
      </Host>
    </Animated.View>
  );
}
