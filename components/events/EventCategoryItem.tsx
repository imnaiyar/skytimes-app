import Colors from "@/constants/Colors";
import { SKY_ZONE } from "@/constants/common";
import { formatTime, getEventStatus, GroupedEvent } from "@/utils/event";
import { useNow, usePulse } from "@/utils/hooks";
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
  onTogglePin,
  onEnableNotification,
  onDisableNotification,
  onEditNotificationOffset,
  notificationsEnabled,
  index = 0,
}: {
  item: GroupedEvent;
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
  const now = useNow();

  const status = getEventStatus(item.event.status);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const endTime = status === "active" ? item.event.status.endTime : null;
  const nextTime = item.event.nextOccurence;

  let timeLabel = `${formatReadable(DateTime.fromMillis(endTime ?? nextTime, { zone: SKY_ZONE }))} `;
  if (status === "upcoming") {
    timeLabel += `(in ${formatTime(nextTime - now)})`;
  } else if (status === "active") {
    timeLabel = "Ends at " + timeLabel + `(in ${formatTime(endTime! - now)})`;
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
          backgroundColor: themeColors.success,
          borderColor: themeColors.successSurface,
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
            status === "active" && { color: themeColors.successSurface },
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
                  ? themeColors.successSurface
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
              color={
                item.pinned ? themeColors.successSurface : themeColors.icon
              }
            />
          </Pressable>
        </View>
      </View>
      <Text
        style={[
          styles.timer,
          { color: themeColors.mutedText },
          status === "active" && { color: themeColors.successSurface },
          status === "active" && styles.activeTimer,
        ]}
      >
        {timeLabel}
      </Text>

      {status === "active" && (
        <Text style={[styles.badge, { color: themeColors.successSurface }]}>
          LIVE
        </Text>
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
