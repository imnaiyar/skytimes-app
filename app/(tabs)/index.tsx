import { SkytimesUtils } from "@skyhelperbot/utils";
import { useEffect, useMemo } from "react";
import { Platform, Pressable, View } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { CategoryList } from "@/components/EventList";
import { Header } from "@/components/ui/Header";
import { useTheme } from "@/constants/Colors";
import {
  useNotificationSettings,
  useNotifiedEvents,
  useReorderMode,
  useWidgetSettings,
} from "@/utils/hooks";
import { syncNotifications } from "@/utils/notifications";
import { renderEventsWidget } from "@/widgets/EventsWidget";
import { SKY_EVENTS_WIDGET_NAME } from "@/widgets/constants";
import { getWidgetEventRows } from "@/widgets/events-widget-data";
import {
  Entypo,
  FontAwesome,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import { Link } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TabTwoScreen() {
  const {
    events,
    settings,
    setEventNotificationOffset,
    disableEventNotification,
    notificationOffsetsById,
  } = useSync();

  const themeColors = useTheme();
  const rotation = useSharedValue(0);
  const { reorder, setReorder } = useReorderMode();

  const reorderStyle = useAnimatedStyle(() => ({
    opacity: 1 - rotation.value,
    transform: [
      { rotate: `${rotation.value * 90}deg` },
      { scale: 1 - 0.3 * rotation.value },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: rotation.value,
    transform: [
      { rotate: `${-90 + rotation.value * 90}deg` },
      { scale: 0.7 + 0.3 * rotation.value },
    ],
  }));

  const toggle = () => {
    setReorder(!reorder);
    rotation.value = withTiming(rotation.value === 1 ? 0 : 1, {
      duration: 200,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={reorder ? "Re-ordering..." : "SkyTimes"}
        bottomBorder
        right={
          <View
            style={{
              gap: 4,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            {process.env.NODE_ENV === "development" && (
              <Link href="/widget_preview" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Entypo
                      name="popup"
                      size={20}
                      color={themeColors.text}
                      style={{
                        marginRight: 15,
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>
            )}

            {!reorder && (
              <Link href="/instruction" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={20}
                      color={themeColors.text}
                      style={{
                        marginRight: 15,
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>
            )}
            <Pressable onPress={toggle}>
              <Animated.View>
                <Animated.View style={[{ position: "relative" }, reorderStyle]}>
                  <FontAwesome6
                    name="arrow-down-wide-short"
                    size={20}
                    color={themeColors.text}
                  />
                </Animated.View>

                <Animated.View style={[{ position: "absolute" }, checkStyle]}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={themeColors.text}
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>
        }
      />
      <CategoryList
        events={events}
        notificationOffsetsById={notificationOffsetsById}
        onSetNotificationOffset={setEventNotificationOffset}
        onDisableNotification={disableEventNotification}
        notificationsEnabled={settings.enabled}
      />
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
