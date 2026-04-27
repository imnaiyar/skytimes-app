import { ConfigPlugin, withAppBuildGradle } from "expo/config-plugins";

const ABI_SPLITS_BLOCK = [
  "    splits {",
  "        abi {",
  "            enable true",
  "            reset()",
  '            include "armeabi-v7a", "arm64-v8a"',
  "            universalApk false",
  "        }",
  "    }",
].join("\n");

const withAbiSplits: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (!contents || /splits\s*\{\s*abi\s*\{/.test(contents)) {
      return config;
    }

    const androidBlockMatch = contents.match(/android\s*\{\s*\n/);
    if (!androidBlockMatch) {
      return config;
    }

    config.modResults.contents = contents.replace(
      /android\s*\{\s*\n/,
      `${androidBlockMatch[0]}${ABI_SPLITS_BLOCK}\n\n`,
    );

    return config;
  });
};

export default withAbiSplits;
