import { SkytimesUtils } from "@skyhelperbot/utils";
import { useEffect, useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { CategoryList } from "@/components/EventList";
import {
  useNotificationSettings,
  useNotifiedEvents,
  useNow,
  useWidgetSettings,
} from "@/utils/hooks";
import { syncNotifications } from "@/utils/notifications";
import { renderEventsWidget } from "@/widgets/EventsWidget";
import { SKY_EVENTS_WIDGET_NAME } from "@/widgets/constants";
import { getWidgetEventRows } from "@/widgets/events-widget-data";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabTwoScreen() {
  const now = useNow();
  const events = useMemo(() => SkytimesUtils.allEventDetails(), [now]);
  const { settings } = useNotificationSettings();
  const {
    notificationOffsetsById,
    setEventNotificationOffset,
    disableEventNotification,
  } = useNotifiedEvents();
  const eventsSyncSignature = useMemo(
    () =>
      events
        .map(
          ([key, event]) => `${String(key)}:${event.nextOccurence.toMillis()}`,
        )
        .join("|"),
    [events],
  );
  const notificationOffsetsSignature = useMemo(
    () =>
      Object.entries(notificationOffsetsById)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([eventId, minutes]) => `${eventId}:${minutes}`)
        .join("|"),
    [notificationOffsetsById],
  );
  const notificationSyncInput = useMemo(
    () => ({
      events,
      notificationOffsetsById,
    }),
    [eventsSyncSignature, notificationOffsetsSignature],
  );
  const widgetSyncSignature = useMemo(
    () =>
      events
        .map(([key, event]) => {
          const endTime = event.status.endTime?.toMillis() ?? 0;
          return `${String(key)}:${event.status.active ? "active" : "upcoming"}:${endTime}:${event.nextOccurence.toMillis()}`;
        })
        .join("|"),
    [events],
  );

  useEffect(() => {
    syncNotifications(
      notificationSyncInput.events,
      notificationSyncInput.notificationOffsetsById,
      settings,
    ).catch(() => undefined);
  }, [notificationSyncInput, settings]);

  const { widgetSettings } = useWidgetSettings();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    requestWidgetUpdate({
      widgetName: SKY_EVENTS_WIDGET_NAME,
      renderWidget: () =>
        renderEventsWidget(
          getWidgetEventRows(
            undefined,
            widgetSettings.enabled
              ? widgetSettings.selectedEventKeys
              : undefined,
          ),
        ),
    }).catch(() => undefined);
  }, [widgetSyncSignature, widgetSettings]);

  return (
    <GestureHandlerRootView>
      <CategoryList
        events={events}
        notificationOffsetsById={notificationOffsetsById}
        onSetNotificationOffset={setEventNotificationOffset}
        onDisableNotification={disableEventNotification}
        notificationsEnabled={settings.enabled}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 4,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
