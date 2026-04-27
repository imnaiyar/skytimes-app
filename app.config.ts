import type { ExpoConfig } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";
import "tsx/cjs";
import pkg from "./package.json" with { type: "json" };
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
      minHeight: "120dp",
      targetCellWidth: 5,
      targetCellHeight: 2,
      previewImage: "./assets/images/widget_preview.png",
      updatePeriodMillis: 1_800_000,
      widgetFeatures: "reconfigurable|configuration_optional",
      resizeMode: "horizontal",
    },
  ],
  fonts: ["./assets/fonts/material.ttf"],
};

const plugins: ExpoConfig["plugins"] = [
  "expo-router",
  "expo-font",
  "expo-image",
  "expo-web-browser",
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
        useLegacyPackaging: true,
        useHermesV1: true,
        buildReactNativeFromSource: true,
      },
    },
  ],
  ["react-native-android-widget", widgetConfig],
  ["expo-gradle-jvmargs", { xmx: "4g", maxMetaspace: "1024m" }],
  "react-native-video",
  "./plugins/manifest.ts",
];

// only do app signing in prod
if (!isDev) {
  plugins.push(
    [
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
    ],
    "./plugins/abi-splits.ts",
  );
}

const backgroundColor = "#1C1B1F";

const config: ExpoConfig = {
  name: packageName,
  slug: packageName.toLowerCase(),
  version: pkg.version,
  orientation: "portrait",
  icon: "./assets/images/sleepykid.png",
  scheme: "skytimes",
  jsEngine: "hermes",
  splash: {
    image: "./assets/images/sleepykid.png",
    resizeMode: "contain",
    backgroundColor,
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
      backgroundColor,
    },
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
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: isDev
        ? "036f17e4-3bc6-4d50-bb1c-f7d7aa2a8362"
        : "6479b648-2cdf-472f-ba57-55fbdeeb9f9e",
    },
  },
};

export default config;
