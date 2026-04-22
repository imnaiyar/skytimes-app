import {
  useNotificationSettings,
  useNotifiedEvents,
  useWidgetSettings,
} from "@/utils/hooks";
import { syncNotifications } from "@/utils/notifications";
import { renderEventsWidget } from "@/widgets/EventsWidget";
import { SKY_EVENTS_WIDGET_NAME } from "@/widgets/constants";
import { getWidgetEventRows } from "@/widgets/events-widget-data";
import { SkytimesUtils } from "@skyhelperbot/utils";
import { useEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import EventCategoryList from "./EventCategoryList";
import EventHeader from "./EventHeader";

export default function EventsScreen() {
  const {
    events,
    settings,
    setEventNotificationOffset,
    disableEventNotification,
    notificationOffsetsById,
  } = useSync();

  return (
    <View style={{ flex: 1 }}>
      <EventHeader />
      <View style={{ flex: 1, padding: 5 }}>
        <EventCategoryList
          events={events}
          notificationOffsetsById={notificationOffsetsById}
          onSetNotificationOffset={setEventNotificationOffset}
          onDisableNotification={disableEventNotification}
          notificationsEnabled={settings.enabled}
        />
      </View>
    </View>
  );
}

function useSync() {
  const events = SkytimesUtils.allEventDetails();
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

  return {
    events,
    setEventNotificationOffset,
    disableEventNotification,
    notificationOffsetsById,
    settings,
  };
}
