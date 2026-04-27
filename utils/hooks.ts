import { CATEGORY_ORDER } from "@/constants/common";

import {
  EventDetails,
  SkytimesUtils,
  type EventKey,
} from "@skyhelperbot/utils";

import { useCallback, useEffect, useMemo } from "react";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { create } from "zustand";
import { getEventSignature } from "./event";

import { useDailyQuestsStore } from "./quests";
import {
  clampNotificationOffsetMinutes,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_WIDGET_SETTINGS,
  loadCategoryOrder,
  loadNotificationOffsets,
  loadNotificationSettings,
  loadPinnedEvents,
  loadWidgetSettings,
  normalizeCategoryOrder,
  saveCategoryOrder,
  saveNotificationOffsets,
  saveNotificationSettings,
  savePinnedEvents,
  saveWidgetSettings,
  type NotificationOffsetsByEventId,
  type NotificationSettings,
  type WidgetSettings,
} from "./storage";

type ReorderModeState = {
  reorder: boolean;
  setReorder: (v: boolean) => void;
};

export const useDebugMode = create<{
  DEBUG: boolean;
  setDebugMode: (v: boolean) => void;
}>((set) => ({
  DEBUG: false,
  setDebugMode: (v) => set({ DEBUG: v }),
}));

export const useReorderMode = create<ReorderModeState>((set) => ({
  reorder: false,
  setReorder: (v: boolean) => set({ reorder: v }),
}));

type SettingsState = {
  hydrated: boolean;
  hydrating: boolean;
  pinnedKeys: EventKey[];
  notificationOffsetsById: NotificationOffsetsByEventId;
  categoryOrder: string[];
  notificationSettings: NotificationSettings;
  widgetSettings: WidgetSettings;
  hydrate: () => Promise<void>;
  setPinnedKeys: (
    updater: EventKey[] | ((prev: EventKey[]) => EventKey[]),
  ) => void;
  setNotificationOffsetsById: (
    updater:
      | NotificationOffsetsByEventId
      | ((prev: NotificationOffsetsByEventId) => NotificationOffsetsByEventId),
  ) => void;
  setCategoryOrder: (order: string[]) => void;
  setNotificationSettings: (
    updater:
      | NotificationSettings
      | ((prev: NotificationSettings) => NotificationSettings),
  ) => void;
  setWidgetSettings: (
    updater: WidgetSettings | ((prev: WidgetSettings) => WidgetSettings),
  ) => void;
};

const useClockStore = create<{ now: number }>(() => ({
  now: Date.now(),
}));

const initialEvents = SkytimesUtils.allEventDetails();
const initialEventsSignature = getEventSignature(initialEvents);

export const useEventsStore = create<{
  events: EventDetails[];
  eventsSignature: string;
}>((set) => ({
  events: initialEvents,
  eventsSignature: initialEventsSignature,
}));

const globalClock = globalThis as typeof globalThis & {
  __gameAppClockStarted?: boolean;
};

if (!globalClock.__gameAppClockStarted) {
  globalClock.__gameAppClockStarted = true;
  setInterval(() => {
    const events = SkytimesUtils.allEventDetails();
    useClockStore.setState({ now: Date.now() });
    useEventsStore.setState({
      events,
      eventsSignature: getEventSignature(events),
    });
  }, 1000);
}

export function useNow() {
  return useClockStore((state) => state.now);
}

const DEFAULT_CATEGORY_ORDER: string[] = [...CATEGORY_ORDER];

const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  hydrating: false,
  pinnedKeys: [],
  notificationOffsetsById: {},
  categoryOrder: DEFAULT_CATEGORY_ORDER,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  widgetSettings: DEFAULT_WIDGET_SETTINGS,
  setPinnedKeys: (updater) =>
    set((state) => ({
      pinnedKeys:
        typeof updater === "function" ? updater(state.pinnedKeys) : updater,
    })),
  setNotificationOffsetsById: (updater) =>
    set((state) => ({
      notificationOffsetsById:
        typeof updater === "function"
          ? updater(state.notificationOffsetsById)
          : updater,
    })),
  setCategoryOrder: (order) => set({ categoryOrder: order }),
  setNotificationSettings: (updater) =>
    set((state) => ({
      notificationSettings:
        typeof updater === "function"
          ? updater(state.notificationSettings)
          : updater,
    })),
  setWidgetSettings: (updater) =>
    set((state) => ({
      widgetSettings:
        typeof updater === "function" ? updater(state.widgetSettings) : updater,
    })),
  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });

    const [
      pinnedResult,
      offsetsResult,
      orderResult,
      notificationSettingsResult,
      widgetSettingsResult,
    ] = await Promise.allSettled([
      loadPinnedEvents(),
      loadNotificationOffsets(),
      loadCategoryOrder(),
      loadNotificationSettings(),
      loadWidgetSettings(),
      useDailyQuestsStore.getState().fetchQuests(),
    ]);

    set({
      pinnedKeys: pinnedResult.status === "fulfilled" ? pinnedResult.value : [],
      notificationOffsetsById:
        offsetsResult.status === "fulfilled" ? offsetsResult.value : {},
      categoryOrder:
        orderResult.status === "fulfilled"
          ? orderResult.value
          : DEFAULT_CATEGORY_ORDER,
      notificationSettings:
        notificationSettingsResult.status === "fulfilled"
          ? notificationSettingsResult.value
          : DEFAULT_NOTIFICATION_SETTINGS,
      widgetSettings:
        widgetSettingsResult.status === "fulfilled"
          ? widgetSettingsResult.value
          : DEFAULT_WIDGET_SETTINGS,
      hydrated: true,
      hydrating: false,
    });
  },
}));

export function useSettingsHydration() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const hydrating = useSettingsStore((state) => state.hydrating);
  const hydrate = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    if (!hydrated && !hydrating) {
      hydrate().catch(() => undefined);
    }
  }, [hydrated, hydrating, hydrate]);

  return { hydrated, hydrating };
}

export function usePinnedEvents() {
  const pinnedKeys = useSettingsStore((state) => state.pinnedKeys);
  const setPinnedKeys = useSettingsStore((state) => state.setPinnedKeys);

  const pinnedSet = new Set(pinnedKeys);

  const togglePin = useCallback((key: EventKey) => {
    setPinnedKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((existing) => existing !== key)
        : [...prev, key];

      savePinnedEvents(next).catch(() => undefined);
      return next;
    });
  }, []);

  return { pinnedSet, togglePin };
}

export function useNotifiedEvents() {
  const notificationOffsetsById = useSettingsStore(
    (state) => state.notificationOffsetsById,
  );
  const setNotificationOffsetsById = useSettingsStore(
    (state) => state.setNotificationOffsetsById,
  );

  const notificationEnabledSet = useMemo(() => {
    return new Set(
      Object.keys(notificationOffsetsById).map((key) => key as EventKey),
    );
  }, [notificationOffsetsById]);

  const getEventNotificationOffset = useCallback(
    (key: EventKey) => notificationOffsetsById[String(key)],
    [notificationOffsetsById],
  );

  const setEventNotificationOffset = useCallback(
    (key: EventKey, offsetMinutes: number) => {
      setNotificationOffsetsById((previous) => {
        const next = {
          ...previous,
          [String(key)]: clampNotificationOffsetMinutes(offsetMinutes),
        };

        saveNotificationOffsets(next).catch(() => undefined);
        return next;
      });
    },
    [],
  );

  const disableEventNotification = useCallback((key: EventKey) => {
    setNotificationOffsetsById((previous) => {
      const next = { ...previous };
      delete next[String(key)];
      saveNotificationOffsets(next).catch(() => undefined);
      return next;
    });
  }, []);

  return {
    notificationOffsetsById,
    notificationEnabledSet,
    getEventNotificationOffset,
    setEventNotificationOffset,
    disableEventNotification,
  };
}

export function useCategoryOrder() {
  const categoryOrder = useSettingsStore((state) => state.categoryOrder);
  const setCategoryOrderState = useSettingsStore(
    (state) => state.setCategoryOrder,
  );

  const setCategoryOrder = useCallback((order: string[]) => {
    const normalized = normalizeCategoryOrder(order);
    setCategoryOrderState(normalized);
    saveCategoryOrder(normalized).catch(() => undefined);
  }, []);

  return { categoryOrder, setCategoryOrder };
}

export function usePulse(active = true) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [active]);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.01]);
    const opacity = interpolate(progress.value, [0, 1], [0.9, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return style;
}

export function useNotificationSettings() {
  const settings = useSettingsStore((state) => state.notificationSettings);
  const setSettingsState = useSettingsStore(
    (state) => state.setNotificationSettings,
  );

  const updateSettings = useCallback((next: Partial<NotificationSettings>) => {
    setSettingsState((previous) => {
      const merged = { ...previous, ...next };
      saveNotificationSettings(merged).catch(() => undefined);
      return merged;
    });
  }, []);

  return { settings, updateSettings };
}

export function useWidgetSettings() {
  const widgetSettings = useSettingsStore((state) => state.widgetSettings);
  const setWidgetSettings = useSettingsStore(
    (state) => state.setWidgetSettings,
  );

  const updateWidgetSettings = useCallback((next: Partial<WidgetSettings>) => {
    setWidgetSettings((prev) => {
      const merged = { ...prev, ...next };
      saveWidgetSettings(merged).catch(() => undefined);
      return merged;
    });
  }, []);

  return { widgetSettings, updateWidgetSettings };
}
