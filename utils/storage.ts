import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EventKey } from "@skyhelperbot/utils";
import { CATEGORY_ORDER } from "@/constants/categories";

const PINNED_EVENTS_STORAGE_KEY = "events:pinned";
const NOTIFIED_EVENTS_STORAGE_KEY = "events:notified";
const CATEGORY_ORDER_STORAGE_KEY = "categories:order";
const NOTIFICATION_SETTINGS_STORAGE_KEY = "notifications:settings";
const WIDGET_SETTINGS_STORAGE_KEY = "widget:events:settings";
const DEFAULT_CATEGORY_ORDER: readonly string[] = CATEGORY_ORDER;
export const MIN_NOTIFICATION_OFFSET_MINUTES = 0;
export const MAX_NOTIFICATION_OFFSET_MINUTES = 15;
export const DEFAULT_NOTIFICATION_OFFSET_MINUTES = 5;
export const NOTIFICATION_OFFSET_STEP_MINUTES = 1;

export type NotificationOffsetsByEventId = Record<string, number>;

export type NotificationSettings = {
  enabled: boolean;
  soundEnabled: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
};

function safeParseArray(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseObject(value: string | null): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeCategoryOrder(order: string[]) {
  const valid = order.filter(category => DEFAULT_CATEGORY_ORDER.includes(category));
  const missing = DEFAULT_CATEGORY_ORDER.filter(category => !valid.includes(category));

  return [...valid, ...missing];
}

export async function loadPinnedEvents() {
  const value = await AsyncStorage.getItem(PINNED_EVENTS_STORAGE_KEY);
  return safeParseArray(value) as EventKey[];
}

export async function savePinnedEvents(keys: EventKey[]) {
  await AsyncStorage.setItem(PINNED_EVENTS_STORAGE_KEY, JSON.stringify(keys));
}

export function clampNotificationOffsetMinutes(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return DEFAULT_NOTIFICATION_OFFSET_MINUTES;

  const rounded = Math.round(parsed);
  return Math.min(
    MAX_NOTIFICATION_OFFSET_MINUTES,
    Math.max(MIN_NOTIFICATION_OFFSET_MINUTES, rounded),
  );
}

function mapLegacyNotifiedKeys(keys: EventKey[]) {
  return keys.reduce<NotificationOffsetsByEventId>((acc, key) => {
    acc[String(key)] = DEFAULT_NOTIFICATION_OFFSET_MINUTES;
    return acc;
  }, {});
}

export async function loadNotificationOffsets() {
  const raw = await AsyncStorage.getItem(NOTIFIED_EVENTS_STORAGE_KEY);
  if (!raw) return {} as NotificationOffsetsByEventId;

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return mapLegacyNotifiedKeys(parsed as EventKey[]);
    }

    if (!parsed || typeof parsed !== "object") {
      return {} as NotificationOffsetsByEventId;
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<NotificationOffsetsByEventId>(
      (acc, [key, value]) => {
        acc[String(key)] = clampNotificationOffsetMinutes(value);
        return acc;
      },
      {},
    );
  } catch {
    return {} as NotificationOffsetsByEventId;
  }
}

export async function saveNotificationOffsets(map: NotificationOffsetsByEventId) {
  await AsyncStorage.setItem(NOTIFIED_EVENTS_STORAGE_KEY, JSON.stringify(map));
}

export async function loadCategoryOrder() {
  const value = await AsyncStorage.getItem(CATEGORY_ORDER_STORAGE_KEY);
  return normalizeCategoryOrder(safeParseArray(value) as string[]);
}

export async function saveCategoryOrder(order: string[]) {
  await AsyncStorage.setItem(CATEGORY_ORDER_STORAGE_KEY, JSON.stringify(order));
}

export async function loadNotificationSettings() {
  const parsed = safeParseObject(await AsyncStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY));

  return {
    enabled:
      typeof parsed.enabled === "boolean"
        ? parsed.enabled
        : DEFAULT_NOTIFICATION_SETTINGS.enabled,
    soundEnabled:
      typeof parsed.soundEnabled === "boolean"
        ? parsed.soundEnabled
        : DEFAULT_NOTIFICATION_SETTINGS.soundEnabled,
  } satisfies NotificationSettings;
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export type WidgetSettings = {
  enabled: boolean; // whether custom selection is enabled
  selectedEventKeys: string[]; // array of EventKey string identifiers
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  enabled: false,
  selectedEventKeys: [],
};

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  const parsed = safeParseObject(await AsyncStorage.getItem(WIDGET_SETTINGS_STORAGE_KEY));

  return {
    enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_WIDGET_SETTINGS.enabled,
    selectedEventKeys: Array.isArray(parsed.selectedEventKeys) ? (parsed.selectedEventKeys as string[]) : DEFAULT_WIDGET_SETTINGS.selectedEventKeys,
  };
}

export async function saveWidgetSettings(settings: WidgetSettings) {
  await AsyncStorage.setItem(WIDGET_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
