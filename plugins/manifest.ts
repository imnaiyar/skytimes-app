import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const withAndroidPlugin: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config?.modResults?.manifest;
    if (manifest) {
      if (!manifest["uses-permission"]) {
        manifest["uses-permission"] = [];
      }

      manifest["uses-permission"].push({
        $: {
          "android:name": "android.permission.SCHEDULE_EXACT_ALARM",
        },
      });
    }

    return config;
  });
};

export default withAndroidPlugin;
