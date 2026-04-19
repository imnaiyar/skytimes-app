import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { GroupedEvent } from "@/utils/event";
import { formatTime, getEventStatus } from "@/utils/event";
import { usePulse } from "@/utils/hooks";
import { DEFAULT_NOTIFICATION_OFFSET_MINUTES } from "@/utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { EventKey } from "@skyhelperbot/utils";
import type { DateTime } from "luxon";
import { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { ConfirmAlert } from "./Alert";
import { Text, View } from "./Themed";

const formatReadable = (date: DateTime) => date.toLocal().toFormat("hh:mm a");

export function EventCard({
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
  const colors = [themeColors.eventRowA, themeColors.eventRowB];
  const eventName = item.event.event.name;
  const currentOffsetMinutes =
    item.notificationOffsetMinutes ?? DEFAULT_NOTIFICATION_OFFSET_MINUTES;

  return (
    <Container
      style={[
        styles.eventCard,
        { backgroundColor: colors[index % colors.length] },
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
        <Text style={styles.title}>{eventName}</Text>
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

export function CategorySection({
  title,
  events,
  now,
  drag,
  reorder,
  onTogglePin,
  onEnableNotification,
  onDisableNotification,
  onEditNotificationOffset,
  notificationsEnabled,
  disabled = false,
}: {
  title: string;
  events: GroupedEvent[];
  now: number;
  drag?: () => void;
  reorder?: boolean;
  onTogglePin: (key: EventKey) => void;
  onEnableNotification: (key: EventKey, eventName: string) => void;
  onDisableNotification: (key: EventKey, eventName: string) => void;
  onEditNotificationOffset: (
    key: EventKey,
    eventName: string,
    currentOffsetMinutes: number,
  ) => void;
  notificationsEnabled: boolean;
  disabled?: boolean;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const [collapsed, setCollapsed] = useState(false);
  const props = {
    onPress: reorder ? undefined : () => setCollapsed(!collapsed),
    onLongPress: reorder && drag ? drag : undefined,
    delayLongPress: 150,
  };
  return (
    <View
      style={[
        styles.category,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <TouchableOpacity
        {...props}
        style={[
          styles.categoryHeader,
          { backgroundColor: themeColors.card },
          disabled && { opacity: 0.2 },
        ]}
        disabled={disabled}
      >
        <Text style={styles.categoryTitle}>
          {title} ({events.length})
        </Text>
        {reorder ? (
          <Ionicons
            name="reorder-three"
            size={25}
            color={themeColors.icon}
            style={{ marginRight: 15 }}
          />
        ) : (
          <Text style={[styles.chevron, { color: themeColors.mutedText }]}>
            {collapsed ? "▼" : "▲"}
          </Text>
        )}
      </TouchableOpacity>

      {!collapsed &&
        !reorder &&
        events.map((item, index) => (
          <View key={item.key} style={{ backgroundColor: "transparent" }}>
            <EventCard
              item={item}
              now={now}
              onTogglePin={onTogglePin}
              onEnableNotification={onEnableNotification}
              onDisableNotification={onDisableNotification}
              onEditNotificationOffset={onEditNotificationOffset}
              notificationsEnabled={notificationsEnabled}
              index={index}
            />
            {index + 1 < events.length && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: themeColors.divider },
                ]}
              />
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 15,
    overflow: "hidden",
  },

  eventCard: {
    padding: 8,
  },

  activeCard: {
    borderWidth: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  timer: {
    marginTop: 8,
  },

  activeTimer: {
    fontWeight: "bold",
  },

  badge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  chevron: {},
  separator: {
    height: 1.15,
    width: "100%",
  },
});
