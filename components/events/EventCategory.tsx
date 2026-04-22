import Colors from "@/constants/Colors";
import { GroupedEvent } from "@/utils/event";
import { Ionicons } from "@expo/vector-icons";
import { EventKey } from "@skyhelperbot/utils";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Collapsible } from "react-native-fast-collapsible";
import { Text, View } from "../Themed";
import { AnimatedChevron } from "../ui/AnimatedChevron";
import { useColorScheme } from "../useColorScheme";
import EventCategoryItem from "./EventCategoryItem";

export default function EventCategory(props: EventCategoryProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  const [collapsed, setCollapsed] = useState(false);

  const pressableprops = {
    onPress: props.reorder ? undefined : () => setCollapsed(!collapsed),
    onLongPress: props.reorder && props.drag ? props.drag : undefined,
    delayLongPress: 150,
  };
  return (
    <View
      style={[
        styles.category,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <Pressable
        {...pressableprops}
        style={(state) => [
          styles.categoryHeader,
          {
            backgroundColor:
              state.hovered || state.pressed
                ? themeColors.overlay
                : themeColors.card,
          },
          props.disabled && { opacity: 0.2 },
        ]}
        disabled={props.disabled}
      >
        <Text style={styles.categoryTitle}>
          {props.title} ({props.events.length})
        </Text>
        {props.reorder ? (
          <Ionicons
            name="reorder-three"
            size={25}
            color={themeColors.icon}
            style={{ marginRight: 15 }}
          />
        ) : (
          <AnimatedChevron
            isCollapsed={collapsed}
            color={themeColors.text}
            duration={200}
            size={16}
          />
        )}
      </Pressable>

      <Collapsible duration={200} isVisible={!collapsed && !props.reorder}>
        {props.events.map((item, index) => (
          <View key={item.key} style={{ backgroundColor: "transparent" }}>
            <EventCategoryItem
              item={item}
              now={props.now}
              onTogglePin={props.onTogglePin}
              onEnableNotification={props.onEnableNotification}
              onDisableNotification={props.onDisableNotification}
              onEditNotificationOffset={props.onEditNotificationOffset}
              notificationsEnabled={props.notificationsEnabled}
              index={index}
            />
            {index + 1 < props.events.length && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: themeColors.divider },
                ]}
              />
            )}
          </View>
        ))}
      </Collapsible>
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

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  separator: {
    height: 1.15,
    width: "100%",
  },
});

interface EventCategoryProps {
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
}
