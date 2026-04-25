import { CATEGORY_ORDER } from "@/constants/common";
import {
  EventDetails,
  SkytimesUtils,
  type EventKey,
} from "@skyhelperbot/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { create } from "zustand";
import { getEventSignature } from "./event";
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

export function usePinnedEvents() {
  const [pinnedKeys, setPinnedKeys] = useState<EventKey[]>([]);

  useEffect(() => {
    let mounted = true;

    loadPinnedEvents()
      .then((keys) => {
        if (!mounted) return;
        setPinnedKeys(keys);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

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
  const [notificationOffsetsById, setNotificationOffsetsById] =
    useState<NotificationOffsetsByEventId>({});

  useEffect(() => {
    let mounted = true;

    loadNotificationOffsets()
      .then((map) => {
        if (!mounted) return;
        setNotificationOffsetsById(map);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

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
  const [categoryOrder, setCategoryOrderState] = useState<string[]>(
    DEFAULT_CATEGORY_ORDER,
  );

  useEffect(() => {
    let mounted = true;

    loadCategoryOrder()
      .then((order) => {
        if (!mounted) return;
        setCategoryOrderState(order);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

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
  const [settings, setSettingsState] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );

  useEffect(() => {
    let mounted = true;

    loadNotificationSettings()
      .then((value) => {
        if (!mounted) return;
        setSettingsState(value);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

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
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(
    DEFAULT_WIDGET_SETTINGS,
  );

  useEffect(() => {
    let mounted = true;

    loadWidgetSettings()
      .then((value) => {
        if (!mounted) return;
        setWidgetSettings(value);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const updateWidgetSettings = useCallback((next: Partial<WidgetSettings>) => {
    setWidgetSettings((prev) => {
      const merged = { ...prev, ...next };
      saveWidgetSettings(merged).catch(() => undefined);
      return merged;
    });
  }, []);

  return { widgetSettings, updateWidgetSettings };
}
