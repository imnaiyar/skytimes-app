import { SkyClock } from "@/components/Clock";
import type { GroupedEvent } from "@/utils/event";
import { groupEvents, sortGroupedEvents } from "@/utils/event";
import {
  useCategoryOrder,
  useNow,
  usePinnedEvents,
  useReorderMode,
} from "@/utils/hooks";
import {
  DEFAULT_NOTIFICATION_OFFSET_MINUTES,
  type NotificationOffsetsByEventId,
} from "@/utils/storage";
import type { EventDetails, EventKey } from "@skyhelperbot/utils";
import { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Callout } from "./Callout";
import { CategorySection } from "./EventsCard";
import { OffsetPickerModal } from "./OffsetPickerModal";
import { View } from "./Themed";

type NotificationPickerState = {
  mode: "enable" | "edit";
  key: EventKey;
  eventName: string;
  initialOffsetMinutes: number;
};

export function CategoryList({
  events,
  notificationOffsetsById,
  onSetNotificationOffset,
  onDisableNotification,
  notificationsEnabled,
}: {
  events: Array<[EventKey, EventDetails]>;
  notificationOffsetsById: NotificationOffsetsByEventId;
  onSetNotificationOffset: (key: EventKey, offsetMinutes: number) => void;
  onDisableNotification: (key: EventKey) => void;
  notificationsEnabled: boolean;
}) {
  const now = useNow();
  const { pinnedSet, togglePin } = usePinnedEvents();
  const [pickerState, setPickerState] =
    useState<NotificationPickerState | null>(null);
  const grouped = useMemo(
    () => groupEvents(events, pinnedSet, notificationOffsetsById),
    [events, pinnedSet, notificationOffsetsById],
  );
  const { categoryOrder, setCategoryOrder } = useCategoryOrder();
  const hoistedEvents = useMemo(
    () =>
      categoryOrder
        .flatMap((category) => grouped[category] ?? [])
        .filter((item) => item.status === "active" || item.pinned)
        .sort(sortGroupedEvents),
    [categoryOrder, grouped],
  );
  const nonHoistedGrouped = useMemo(
    () =>
      categoryOrder.reduce<Record<string, GroupedEvent[]>>((acc, category) => {
        acc[category] = (grouped[category] ?? []).filter(
          (item) => item.status !== "active" && !item.pinned,
        );
        return acc;
      }, {}),
    [categoryOrder, grouped],
  );
  const openEnableOffsetPicker = useCallback(
    (key: EventKey, eventName: string) => {
      setPickerState({
        mode: "enable",
        key,
        eventName,
        initialOffsetMinutes: DEFAULT_NOTIFICATION_OFFSET_MINUTES,
      });
    },
    [],
  );

  const openEditOffsetPicker = useCallback(
    (key: EventKey, eventName: string, currentOffsetMinutes: number) => {
      setPickerState({
        mode: "edit",
        key,
        eventName,
        initialOffsetMinutes: currentOffsetMinutes,
      });
    },
    [],
  );

  const closeOffsetPicker = useCallback(() => {
    setPickerState(null);
  }, []);

  const saveOffsetPickerValue = useCallback(
    (offsetMinutes: number) => {
      if (!pickerState) return;
      onSetNotificationOffset(pickerState.key, offsetMinutes);
      setPickerState(null);
    },
    [onSetNotificationOffset, pickerState],
  );

  const pickerTitle = pickerState
    ? pickerState.mode === "enable"
      ? `Enable notifications for ${pickerState.eventName}`
      : `Edit reminder for ${pickerState.eventName}`
    : "";
  const pickerDescription =
    pickerState?.mode === "enable"
      ? "Choose how many minutes before the event you want the reminder."
      : "Update reminder offset for this event.";

  const { reorder } = useReorderMode();

  if (reorder) {
    return (
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={categoryOrder}
          keyExtractor={(item) => item}
          ListHeaderComponent={
            <>
              <Callout style={{ marginBottom: 10 }}>
                Long press and drag the three lines to re-arrange the
                categories! You cannot re-arrange the pinned/active category.
              </Callout>
              {!!hoistedEvents.length && (
                <CategorySection
                  title="Pinned & Active"
                  events={hoistedEvents}
                  now={now}
                  reorder
                  disabled={true}
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
          onDragEnd={({ data }) => setCategoryOrder(data)}
          renderItem={({ item, drag }) => (
            <CategorySection
              title={item}
              events={grouped[item] ?? []}
              now={now}
              reorder
              drag={drag}
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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={categoryOrder}
        keyExtractor={(item) => item}
        ListHeaderComponent={
          <>
            <SkyClock />
            {!!hoistedEvents.length && (
              <CategorySection
                title="Pinned & Active"
                events={hoistedEvents}
                now={now}
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
          <CategorySection
            title={item}
            events={nonHoistedGrouped[item] ?? []}
            now={now}
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
