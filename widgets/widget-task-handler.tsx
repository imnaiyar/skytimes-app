import { ToastAndroid } from "react-native";
import {
  type WidgetTaskHandler
} from "react-native-android-widget";

import { renderEventsWidget } from "./EventsWidget";
import { SKY_EVENTS_WIDGET_NAME } from "./constants";

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
  clickAction,
}) => {
  if (widgetInfo.widgetName !== SKY_EVENTS_WIDGET_NAME) return;
  if (widgetAction === "WIDGET_DELETED") return;
  
  if (clickAction === "REFRESH") {
    renderWidget(renderEventsWidget());
    ToastAndroid.show("Refreshed Widget!", ToastAndroid.SHORT);
    return;
  }
  
  if (widgetAction === "WIDGET_CLICK") return;
  
  renderWidget(renderEventsWidget());
};
