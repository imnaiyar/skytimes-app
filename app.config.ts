import type { ExpoConfig } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";

const isDev = process.env.NODE_ENV === "development";

const packageName = isDev ? "SkyTimesDev" : "SkyTimes";
const identifier = isDev ? "com.skytimes.dev" : "com.skytimes.app";
const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: "SkyEvents",
      label: "Sky Events",
      description: "Shows up to 6 upcoming or active events.",
      minWidth: "320dp",
      minHeight: "200dp",
      targetCellWidth: 5,
      targetCellHeight: 2,
      previewImage: "./assets/images/widget_preview.png",
      updatePeriodMillis: 1_800_000,
    },
  ],
  fonts: ["./assets/fonts/material.ttf"],
};

const plugins: ExpoConfig["plugins"] = [
  "expo-router",
  [
    "expo-notifications",
    {
      icon: "./assets/images/sleepykid.png",
      color: "#0d1423d1",
      defaultChannel: "event-reminders",
    },
  ],
  [
    "expo-build-properties",
    {
      android: {
        enableProguardInReleaseBuilds: true,
        enableShrinkResourcesInReleaseBuilds: true,
        enableMinifyInReleaseBuilds: true,
      },
    },
  ],
  ["react-native-android-widget", widgetConfig],
];

// only do app sign in in prod
if (!isDev) {
  plugins.push([
    "expo-signed",
    {
      store_file: {
        key: "STORE_FILE",
        value: "release-key.keystore",
      },
      key_alias: {
        key: "KEY_ALIAS",
        value: process.env.ANDROID_KEYSTORE_ALIAS,
      },
      store_password: {
        key: "STORE_PASSWORD",
        value: process.env.ANDROID_KEYSTORE_PASS,
      },
      key_password: {
        key: "KEY_PASSWORD",
        value: process.env.ANDROID_KEY_PASS,
      },
      keystorePath: "./android/app",
    },
  ]);
}

const config: ExpoConfig = {
  name: packageName,
  slug: packageName.toLowerCase(),
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/sleepykid.png",
  scheme: "skytimes",
  userInterfaceStyle: "dark",
  jsEngine: "hermes",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/sleepykid.png",
    resizeMode: "contain",
    backgroundColor: "#0d1423",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: identifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/sleepykid.png",
      backgroundColor: "#0d1423",
    },
    edgeToEdgeEnabled: true,
    package: identifier,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/sleepykid.png",
  },
  plugins,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "6479b648-2cdf-472f-ba57-55fbdeeb9f9e",
    },
  },
};

export default config;
