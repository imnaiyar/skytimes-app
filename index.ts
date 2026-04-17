import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import { Platform } from "react-native";
import { widgetTaskHandler } from "./widgets/widget-task-handler";

if (Platform.OS === "android") registerWidgetTaskHandler(widgetTaskHandler);
