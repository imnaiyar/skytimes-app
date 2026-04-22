import { useWidgetSettings } from "@/utils/hooks";
import { getWidgetEventRows } from "@/widgets/events-widget-data";
import { DARK_PALETTE, EventsWidget } from "@/widgets/EventsWidget";
import {
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from "expo-notifications";
import * as React from "react";
import { Button, StyleSheet, View } from "react-native";
import { WidgetPreview } from "react-native-android-widget";

const SCHEDULED_NOTIFICATIONS_STORAGE_KEY = "notifications:scheduled";
const NOTIFICATION_SOURCE = "game-app-event";
const ANDROID_CHANNEL_ID = "event-reminders";
export default function HelloWidgetPreviewScreen() {
  const { widgetSettings } = useWidgetSettings();
  const rows = getWidgetEventRows(
    undefined,
    widgetSettings.enabled ? widgetSettings.selectedEventKeys : undefined,
  );
  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          scheduleNotificationAsync({
            content: {
              title: "Test Notification!",
              body: "This is a test notification",
              sound: true,
            },
            trigger: null,
          });
        }}
        title="Test Notification"
      ></Button>

      <Button
        onPress={() => {
          scheduleNotificationAsync({
            content: {
              title: "Test Notification!",
              body: "This is a test notification",
              sound: true,
            },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              channelId: ANDROID_CHANNEL_ID,
              date: Date.now() + 5_000,
            },
          });
        }}
        title="Test Notification (after 5 sec)"
      ></Button>

      <Button
        onPress={() => {
          scheduleNotificationAsync({
            content: {
              title: "Test Notification!",
              body: "This is a test notification",
              sound: true,
            },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              channelId: ANDROID_CHANNEL_ID,
              date: Date.now() + 1_000 * 60 * 5,
            },
          });
        }}
        title="Test Notification (after 5 min)"
      ></Button>

      <WidgetPreview
        renderWidget={() => <EventsWidget rows={rows} palette={DARK_PALETTE} />}
        width={320}
        height={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    padding: 20,
  },
});
