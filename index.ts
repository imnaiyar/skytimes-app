import "expo-router/entry";
import {
  registerWidgetConfigurationScreen,
  registerWidgetTaskHandler,
} from "react-native-android-widget";

import { Platform } from "react-native";
import { widgetTaskHandler } from "./widgets/widget-task-handler";
import { WidgetConfigurationScreen } from "./widgets/WidgetConfiguration";

if (Platform.OS === "android") registerWidgetTaskHandler(widgetTaskHandler);
if (Platform.OS === "android")
  registerWidgetConfigurationScreen(WidgetConfigurationScreen);
