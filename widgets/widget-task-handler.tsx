import { ToastAndroid } from "react-native";
import { type WidgetTaskHandler } from "react-native-android-widget";

import { loadWidgetSettings } from "@/utils/storage";
import { renderEventsWidget } from "./EventsWidget";
import { SKY_EVENTS_WIDGET_NAME } from "./constants";
import { getWidgetEventRows } from "./events-widget-data";

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
  clickAction,
}) => {
  if (widgetInfo.widgetName !== SKY_EVENTS_WIDGET_NAME) return;
  if (widgetAction === "WIDGET_DELETED") return;

  if (clickAction === "REFRESH") {
    // refresh should respect widget settings
    const settings = await loadWidgetSettings().catch(() => undefined);
    const rows =
      settings && settings.enabled
        ? getWidgetEventRows(undefined, settings.selectedEventKeys)
        : getWidgetEventRows();
    renderWidget(renderEventsWidget(rows));
    ToastAndroid.show("Refreshed Widget!", ToastAndroid.SHORT);
    return;
  }

  if (widgetAction === "WIDGET_CLICK") return;

  const settings = await loadWidgetSettings().catch(() => undefined);
  const rows =
    settings && settings.enabled
      ? getWidgetEventRows(undefined, settings.selectedEventKeys)
      : getWidgetEventRows();
  renderWidget(renderEventsWidget(rows));
};
