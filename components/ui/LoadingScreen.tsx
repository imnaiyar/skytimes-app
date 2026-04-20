import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  useCustomSpinner?: boolean;
}

/**
 * LoadingScreen component with animated spinner
 *
 * @param message - Main loading message to display
 * @param subtitle - Optional subtitle/secondary message
 * @param fullScreen - If true, takes up full screen (default: true)
 * @param style - Additional styles to apply
 * @param useCustomSpinner - If true, uses custom animated spinner instead of ActivityIndicator (default: false)
 */
export function LoadingScreen({
  message = "Loading...",
  subtitle,
  fullScreen = true,
  style,
  useCustomSpinner = false,
}: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (useCustomSpinner) {
    return (
      <CustomSpinnerLoading
        message={message}
        subtitle={subtitle}
        fullScreen={fullScreen}
        style={style}
        isDark={isDark}
      />
    );
  }

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator
        size="large"
        color={isDark ? Colors.dark.tint : Colors.light.tint}
        style={styles.spinner}
      />
      {message && <Text style={styles.message}>{message}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * Custom animated spinner variant with rotating pulse effect
 */
function CustomSpinnerLoading({
  message,
  subtitle,
  fullScreen,
  style,
  isDark,
}: {
  message?: string;
  subtitle?: string;
  fullScreen: boolean;
  style?: ViewStyle;
  isDark: boolean;
}) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 1]),
  }));

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <Animated.View style={[styles.customSpinner, spinnerAnimatedStyle]}>
        <Animated.View
          style={[
            styles.spinnerInner,
            {
              borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
            },
            pulseAnimatedStyle,
          ]}
        />
      </Animated.View>
      {message && <Text style={styles.message}>{message}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  spinner: {
    marginBottom: 16,
  },
  customSpinner: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  spinnerInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
