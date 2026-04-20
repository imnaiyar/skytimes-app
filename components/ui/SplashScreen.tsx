import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface SplashScreenProps {
  message?: string;
  showLogo?: boolean;
}

/**
 * Elegant splash/loading screen with animated logo and text
 * Perfect for initial app loading
 */
export function SplashScreen({
  message = "Loading...",
  showLogo = true,
}: SplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColor = Colors[colorScheme ?? "dark"];

  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Rotate animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    // Scale pulse animation
    scale.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    // Fade in text
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [rotation, scale, opacity]);

  const rotatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaledStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scale.value, [0.8, 1], [0.9, 1.1]),
      },
    ],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColor.background,
        },
      ]}
    >
      {/* Decorative background elements */}
      <View
        style={[
          styles.orb,
          styles.orbTop,
          {
            borderColor: themeColor.tint,
            opacity: 0.1,
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbBottom,
          {
            borderColor: themeColor.tint,
            opacity: 0.08,
          },
        ]}
      />

      {/* Main content */}
      <View style={styles.contentContainer}>
        {showLogo && (
          <Animated.View style={[styles.logoContainer, rotatedStyle]}>
            <Animated.View style={scaledStyle}>
              <View
                style={[
                  styles.logoCircle,
                  {
                    borderColor: themeColor.tint,
                    backgroundColor: `${themeColor.tint}20`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.innerCircle,
                    {
                      backgroundColor: themeColor.tint,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          </Animated.View>
        )}

        <Animated.View style={fadeStyle}>
          <Text
            style={[
              styles.message,
              {
                color: themeColor.text,
              },
            ]}
          >
            {message}
          </Text>

          {/* Loading dots animation */}
          <View style={styles.dotsContainer}>
            <LoadingDot delay={0} isDark={isDark} color={themeColor.tint} />
            <LoadingDot delay={100} isDark={isDark} color={themeColor.tint} />
            <LoadingDot delay={200} isDark={isDark} color={themeColor.tint} />
          </View>
        </Animated.View>
      </View>

      {/* Footer text */}
      <Animated.View
        style={[
          fadeStyle,
          {
            position: "absolute",
            bottom: 40,
          },
        ]}
      >
        <Text
          style={[
            styles.footerText,
            {
              color: themeColor.mutedText,
            },
          ]}
        >
          Sky Times
        </Text>
      </Animated.View>
    </View>
  );
}

function LoadingDot({
  delay,
  isDark,
  color,
}: {
  delay: number;
  isDark: boolean;
  color: string;
}) {
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.6, 1], [0.5, 1]),
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          marginLeft: delay / 10,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  contentContainer: {
    alignItems: "center",
    gap: 24,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
    textAlign: "center",
  },
  orb: {
    position: "absolute",
    borderRadius: 500,
    borderWidth: 2,
  },
  orbTop: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  orbBottom: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
});
