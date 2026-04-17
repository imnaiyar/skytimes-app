import type { ExpoConfig } from "expo/config";

const isDev = process.env.NODE_ENV === "development";

const packageName = isDev ? "SkyTimesDev" : "SkyTimes";
const identifier = isDev ? "com.skytimes.dev" : "com.skytimes.app";

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
    backgroundColor: "#0d1423d1",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: identifier,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/sleepykid.png",
      backgroundColor: "#0d1423d1",
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
  plugins: [
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
  ],
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
