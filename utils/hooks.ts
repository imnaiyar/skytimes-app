import { CATEGORY_ORDER } from "@/constants/common";

import {
  EventDetails,
  SkytimesUtils,
  type EventKey,
} from "@skyhelperbot/utils";

import { useEffect } from "react";
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
  loadNotificationOffsets,
  loadUserPreferences,
  loadWidgetSettings,
  normalizeCategoryOrder,
  saveNotificationOffsets,
  saveUserPreferences,
  saveWidgetSettings,
  type NotificationOffsetsByEventId,
  type NotificationSettings,
  type UserPreferences,
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
  clock24h: boolean;
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
  setClock24h: (value: boolean) => void;
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
}>(() => ({
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
  clock24h: false,
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
  setClock24h: (value) => set({ clock24h: value }),
  setWidgetSettings: (updater) =>
    set((state) => ({
      widgetSettings:
        typeof updater === "function" ? updater(state.widgetSettings) : updater,
    })),
  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });

    const [
      preferencesResult,
      offsetsResult,
      widgetSettingsResult,
      questsResult,
    ] = await Promise.allSettled([
      loadUserPreferences(),
      loadNotificationOffsets(),
      loadWidgetSettings(),
      useDailyQuestsStore.getState().fetchQuests(),
    ]);

    void questsResult;

    const fallbackPreferences: UserPreferences = {
      pinnedKeys: [],
      categoryOrder: DEFAULT_CATEGORY_ORDER,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      clock24h: false,
    };

    const preferences =
      preferencesResult.status === "fulfilled"
        ? preferencesResult.value
        : fallbackPreferences;

    set({
      pinnedKeys: preferences.pinnedKeys,
      notificationOffsetsById:
        offsetsResult.status === "fulfilled" ? offsetsResult.value : {},
      categoryOrder: preferences.categoryOrder,
      notificationSettings: preferences.notificationSettings,
      clock24h: preferences.clock24h,
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

  const togglePin = (key: EventKey) => {
    setPinnedKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((existing) => existing !== key)
        : [...prev, key];

      const state = useSettingsStore.getState();
      saveUserPreferences({
        pinnedKeys: next,
        categoryOrder: state.categoryOrder,
        notificationSettings: state.notificationSettings,
        clock24h: state.clock24h,
      }).catch(() => undefined);
      return next;
    });
  };

  return { pinnedSet, togglePin };
}

export function useNotifiedEvents() {
  const notificationOffsetsById = useSettingsStore(
    (state) => state.notificationOffsetsById,
  );
  const setNotificationOffsetsById = useSettingsStore(
    (state) => state.setNotificationOffsetsById,
  );

  const notificationEnabledSet = new Set(
    Object.keys(notificationOffsetsById).map((key) => key as EventKey),
  );

  const getEventNotificationOffset = (key: EventKey) =>
    notificationOffsetsById[String(key)];

  const setEventNotificationOffset = (key: EventKey, offsetMinutes: number) => {
    setNotificationOffsetsById((previous) => {
      const next = {
        ...previous,
        [String(key)]: clampNotificationOffsetMinutes(offsetMinutes),
      };

      saveNotificationOffsets(next).catch(() => undefined);
      return next;
    });
  };

  const disableEventNotification = (key: EventKey) => {
    setNotificationOffsetsById((previous) => {
      const next = { ...previous };
      delete next[String(key)];
      saveNotificationOffsets(next).catch(() => undefined);
      return next;
    });
  };

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

  const setCategoryOrder = (order: string[]) => {
    const normalized = normalizeCategoryOrder(order);
    setCategoryOrderState(normalized);
    const state = useSettingsStore.getState();
    saveUserPreferences({
      pinnedKeys: state.pinnedKeys,
      categoryOrder: normalized,
      notificationSettings: state.notificationSettings,
      clock24h: state.clock24h,
    }).catch(() => undefined);
  };

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

  const updateSettings = (next: Partial<NotificationSettings>) => {
    setSettingsState((previous) => {
      const merged = { ...previous, ...next };
      const state = useSettingsStore.getState();
      saveUserPreferences({
        pinnedKeys: state.pinnedKeys,
        categoryOrder: state.categoryOrder,
        notificationSettings: merged,
        clock24h: state.clock24h,
      }).catch(() => undefined);
      return merged;
    });
  };

  return { settings, updateSettings };
}

export function useWidgetSettings() {
  const widgetSettings = useSettingsStore((state) => state.widgetSettings);
  const setWidgetSettings = useSettingsStore(
    (state) => state.setWidgetSettings,
  );

  const updateWidgetSettings = (next: Partial<WidgetSettings>) => {
    setWidgetSettings((prev) => {
      const merged = { ...prev, ...next };
      saveWidgetSettings(merged).catch(() => undefined);
      return merged;
    });
  };

  return { widgetSettings, updateWidgetSettings };
}

export function useClockFormatPreference() {
  const clock24h = useSettingsStore((state) => state.clock24h);
  const setClock24h = useSettingsStore((state) => state.setClock24h);

  const updateClock24h = (enabled: boolean) => {
    setClock24h(enabled);
    const state = useSettingsStore.getState();
    saveUserPreferences({
      pinnedKeys: state.pinnedKeys,
      categoryOrder: state.categoryOrder,
      notificationSettings: state.notificationSettings,
      clock24h: enabled,
    }).catch(() => undefined);
  };

  return { clock24h, updateClock24h };
}

export function isClock24hEnabled() {
  return useSettingsStore.getState().clock24h;
}
