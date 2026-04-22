import Colors from "@/constants/Colors";
import { formatTime, getEventStatus, GroupedEvent } from "@/utils/event";
import { usePulse } from "@/utils/hooks";
import { DEFAULT_NOTIFICATION_OFFSET_MINUTES } from "@/utils/storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EventKey } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { Text } from "../Themed";
import { ConfirmAlert } from "../ui/Alert";
import { useColorScheme } from "../useColorScheme";

const formatReadable = (date: DateTime) => date.toLocal().toFormat("hh:mm a");

export default function EventCategoryItem({
  item,
  now,
  onTogglePin,
  onEnableNotification,
  onDisableNotification,
  onEditNotificationOffset,
  notificationsEnabled,
  index = 0,
}: {
  item: GroupedEvent;
  now: number;
  onTogglePin: (key: EventKey) => void;
  onEnableNotification: (key: EventKey, eventName: string) => void;
  onDisableNotification: (key: EventKey, eventName: string) => void;
  onEditNotificationOffset: (
    key: EventKey,
    eventName: string,
    currentOffsetMinutes: number,
  ) => void;
  notificationsEnabled: boolean;
  index?: number;
}) {
  const status = getEventStatus(item.event.status);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const endTime = status === "active" ? item.event.status.endTime : null;
  const nextTime = item.event.nextOccurence;

  let timeLabel = `${formatReadable(endTime ?? nextTime)} `;
  if (status === "upcoming") {
    timeLabel += `(in ${formatTime(nextTime.toMillis() - now)})`;
  } else if (status === "active") {
    timeLabel =
      "Ends at " + timeLabel + `(in ${formatTime(endTime!.toMillis() - now)})`;
  } else {
    timeLabel = "Ended";
  }

  const pulseStyle = usePulse(status === "active");
  const Container = status === "active" ? Animated.View : View;

  const iTemcolors = [themeColors.eventRowA, themeColors.eventRowB];

  const eventName = item.event.event.name;
  const currentOffsetMinutes =
    item.notificationOffsetMinutes ?? DEFAULT_NOTIFICATION_OFFSET_MINUTES;

  return (
    <Container
      style={[
        styles.eventCard,
        { backgroundColor: iTemcolors[index % iTemcolors.length] },
        status === "active" && styles.activeCard,
        status === "active" && {
          backgroundColor: themeColors.successSurface,
          borderColor: themeColors.success,
        },
        status === "active" && pulseStyle,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "transparent",
        }}
      >
        <Text
          style={[
            styles.title,
            status === "active" && { color: themeColors.success },
          ]}
        >
          {eventName}
        </Text>
        <View
          style={{
            backgroundColor: "transparent",
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {
              if (item.notified) {
                ConfirmAlert({
                  title: "Disable notifications?",
                  description: `Disable notifications for ${eventName}?`,
                  onOk: () => onDisableNotification(item.key, eventName),
                });
                return;
              }

              onEnableNotification(item.key, eventName);
            }}
            onLongPress={
              item.notified
                ? () =>
                    onEditNotificationOffset(
                      item.key,
                      eventName,
                      currentOffsetMinutes,
                    )
                : undefined
            }
            delayLongPress={220}
          >
            <Ionicons
              name={item.notified ? "notifications" : "notifications-off"}
              size={20}
              color={
                item.notified
                  ? themeColors.success
                  : notificationsEnabled
                    ? themeColors.icon
                    : themeColors.iconMuted
              }
            />
          </Pressable>

          <Pressable onPress={() => onTogglePin(item.key)}>
            <MaterialCommunityIcons
              name={item.pinned ? "pin" : "pin-outline"}
              size={20}
              color={item.pinned ? themeColors.success : themeColors.icon}
            />
          </Pressable>
        </View>
      </View>
      <Text
        style={[
          styles.timer,
          { color: themeColors.mutedText },
          status === "active" && { color: themeColors.success },
          status === "active" && styles.activeTimer,
        ]}
      >
        {timeLabel}
      </Text>

      {status === "active" && (
        <Text style={[styles.badge, { color: themeColors.success }]}>LIVE</Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    marginTop: 8,
    fontSize: 8,
    fontWeight: "bold",
  },

  eventCard: {
    padding: 8,
  },
  activeTimer: {
    fontWeight: "bold",
  },

  activeCard: {
    borderWidth: 1,
  },

  timer: {
    fontSize: 12,
  },
});
