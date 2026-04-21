import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { SplashScreen as CustomSplash } from "@/components/ui/SplashScreen";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { initializeNotifications } from "@/utils/notifications";
import { StatusBar, ToastAndroid } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...Ionicons.font,
    ...Entypo.font,
    ...FontAwesome6.font,
    ...AntDesign.font,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    initializeNotifications().catch((err) =>
      ToastAndroid.show(
        err.message ?? "Notification Error",
        ToastAndroid.SHORT,
      ),
    );
  }, []);

  if (!loaded) {
    return <CustomSplash message="Initializing..." />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  StatusBar.setBarStyle(
    colorScheme === "dark" ? "light-content" : "dark-content",
  );
  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          primary: themeColors.tint,
          background: themeColors.background,
          card: themeColors.card,
          text: themeColors.text,
          border: themeColors.border,
        },
      }}
    >
      <GestureHandlerRootView>
        <React.StrictMode>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="instruction"
              options={{ presentation: "modal", title: "Instructions" }}
            />
            <Stack.Screen
              name="debug"
              options={{ presentation: "modal", title: "Debug Stuff" }}
            />
          </Stack>
        </React.StrictMode>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
