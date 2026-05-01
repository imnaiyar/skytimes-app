import { SkyClock } from "@/components/events/Clock";
import type { GroupedEvent } from "@/utils/event";
import { groupEvents, sortGroupedEvents } from "@/utils/event";
import {
  useCategoryOrder,
  useEventsStore,
  usePinnedEvents,
} from "@/utils/hooks";
import {
  DEFAULT_NOTIFICATION_OFFSET_MINUTES,
  type NotificationOffsetsByEventId,
} from "@/utils/storage";
import { type EventKey } from "@skyhelperbot/utils";
import { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { OffsetPickerModal } from "../OffsetPickerModal";
import { View } from "../Themed";
import EventCategory from "./EventCategory";
import { CategoryReorderDrawer } from "./ReorderCategoryDrawer";
import SkyGameDataSections from "./SkyGameDataSections";
type NotificationPickerState = {
  mode: "enable" | "edit";
  key: EventKey;
  eventName: string;
  initialOffsetMinutes: number;
};

export default function EventCategoryList({
  notificationOffsetsById,
  onSetNotificationOffset,
  onDisableNotification,
  notificationsEnabled,
}: {
  notificationOffsetsById: NotificationOffsetsByEventId;
  onSetNotificationOffset: (key: EventKey, offsetMinutes: number) => void;
  onDisableNotification: (key: EventKey) => void;
  notificationsEnabled: boolean;
}) {
  const { pinnedSet, togglePin } = usePinnedEvents();
  const [pickerState, setPickerState] =
    useState<NotificationPickerState | null>(null);
  const { events, eventsSignature } = useEventsStore();

  // idk what in "events" that changes every second that triggers re-render, even though it shouldn't
  // so using event signature, that only changes when nextOccurence or active status changes for any event
  const grouped = useMemo(
    () => groupEvents(events, pinnedSet, notificationOffsetsById),
    [eventsSignature, pinnedSet, notificationOffsetsById],
  );

  const { categoryOrder, setCategoryOrder } = useCategoryOrder();

  const hoistedEvents = categoryOrder
    .flatMap((category) => grouped[category] ?? [])
    .filter((item) => item.status === "active" || item.pinned)
    .sort(sortGroupedEvents);

  const nonHoistedGrouped = categoryOrder.reduce<
    Record<string, GroupedEvent[]>
  >((acc, category) => {
    acc[category] = (grouped[category] ?? []).filter(
      (item) => item.status !== "active" && !item.pinned,
    );
    return acc;
  }, {});

  const openEnableOffsetPicker = (key: EventKey, eventName: string) => {
    setPickerState({
      mode: "enable",
      key,
      eventName,
      initialOffsetMinutes: DEFAULT_NOTIFICATION_OFFSET_MINUTES,
    });
  };

  const openEditOffsetPicker = (
    key: EventKey,
    eventName: string,
    currentOffsetMinutes: number,
  ) => {
    setPickerState({
      mode: "edit",
      key,
      eventName,
      initialOffsetMinutes: currentOffsetMinutes,
    });
  };

  const closeOffsetPicker = () => {
    setPickerState(null);
  };

  const saveOffsetPickerValue = (offsetMinutes: number) => {
    if (!pickerState) return;
    onSetNotificationOffset(pickerState.key, offsetMinutes);
    setPickerState(null);
  };

  const pickerTitle = pickerState
    ? pickerState.mode === "enable"
      ? `Enable notifications for ${pickerState.eventName}`
      : `Edit reminder for ${pickerState.eventName}`
    : "";
  const pickerDescription =
    pickerState?.mode === "enable"
      ? "Choose how many minutes before the event you want the reminder."
      : "Update reminder offset for this event.";

  return (
    <View>
      <CategoryReorderDrawer
        categoryOrder={categoryOrder}
        setCategoryOrder={setCategoryOrder}
      />
      <FlatList
        data={categoryOrder}
        keyExtractor={(item) => item}
        ListHeaderComponent={
          <>
            <SkyClock />
            <SkyGameDataSections />
            {!!hoistedEvents.length && (
              <EventCategory
                title="Pinned & Active"
                events={hoistedEvents}
                onTogglePin={togglePin}
                onEnableNotification={openEnableOffsetPicker}
                onDisableNotification={(key) => onDisableNotification(key)}
                onEditNotificationOffset={openEditOffsetPicker}
                notificationsEnabled={notificationsEnabled}
              />
            )}
          </>
        }
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <EventCategory
            title={item}
            events={nonHoistedGrouped[item] ?? []}
            onTogglePin={togglePin}
            onEnableNotification={openEnableOffsetPicker}
            onDisableNotification={(key) => onDisableNotification(key)}
            onEditNotificationOffset={openEditOffsetPicker}
            notificationsEnabled={notificationsEnabled}
          />
        )}
      />
      <OffsetPickerModal
        visible={Boolean(pickerState)}
        title={pickerTitle}
        description={pickerDescription}
        initialOffsetMinutes={
          pickerState?.initialOffsetMinutes ??
          DEFAULT_NOTIFICATION_OFFSET_MINUTES
        }
        onCancel={closeOffsetPicker}
        onSave={saveOffsetPickerValue}
      />
    </View>
  );
}
