import { CATEGORY_ORDER } from "@/constants/common";
import type { DailyQuestsSchema } from "@/utils/quests";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EventKey } from "@skyhelperbot/utils";

const USER_PREFERENCES_STORAGE_KEY = "user:preferences";
const NOTIFIED_EVENTS_STORAGE_KEY = "events:notified";
const WIDGET_SETTINGS_STORAGE_KEY = "widget:events:settings";
const DAILY_QUESTS_STORAGE = "quests:daily";
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

export type WidgetSettings = {
  enabled: boolean; // whether custom selection is enabled
  selectedEventKeys: string[]; // array of EventKey string identifiers
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  enabled: false,
  selectedEventKeys: [],
};

export type UserPreferences = {
  pinnedKeys: EventKey[];
  categoryOrder: string[];
  notificationSettings: NotificationSettings;
  clock24h: boolean;
};

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
  const valid = order.filter((category) =>
    DEFAULT_CATEGORY_ORDER.includes(category),
  );
  const missing = DEFAULT_CATEGORY_ORDER.filter(
    (category) => !valid.includes(category),
  );

  return [...valid, ...missing];
}

function normalizeNotificationSettings(value: unknown): NotificationSettings {
  const parsed =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

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

function normalizeWidgetSettings(value: unknown): WidgetSettings {
  const parsed =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof parsed.enabled === "boolean"
        ? parsed.enabled
        : DEFAULT_WIDGET_SETTINGS.enabled,
    selectedEventKeys: Array.isArray(parsed.selectedEventKeys)
      ? (parsed.selectedEventKeys as string[])
      : DEFAULT_WIDGET_SETTINGS.selectedEventKeys,
  };
}

function normalizeUserPreferences(
  parsed: Record<string, unknown>,
): UserPreferences {
  return {
    pinnedKeys: Array.isArray(parsed.pinnedKeys)
      ? (parsed.pinnedKeys as EventKey[])
      : [],
    categoryOrder: normalizeCategoryOrder(
      Array.isArray(parsed.categoryOrder)
        ? (parsed.categoryOrder as string[])
        : (DEFAULT_CATEGORY_ORDER as string[]),
    ),
    notificationSettings: normalizeNotificationSettings(
      parsed.notificationSettings,
    ),
    clock24h: typeof parsed.clock24h === "boolean" ? parsed.clock24h : false,
  };
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(USER_PREFERENCES_STORAGE_KEY);

  if (raw) {
    return normalizeUserPreferences(safeParseObject(raw));
  }

  return {
    pinnedKeys: [],
    categoryOrder: [...DEFAULT_CATEGORY_ORDER],
    notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
    clock24h: false,
  } satisfies UserPreferences;
}

export async function saveUserPreferences(preferences: UserPreferences) {
  await AsyncStorage.setItem(
    USER_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
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

    return Object.entries(
      parsed as Record<string, unknown>,
    ).reduce<NotificationOffsetsByEventId>((acc, [key, value]) => {
      acc[String(key)] = clampNotificationOffsetMinutes(value);
      return acc;
    }, {});
  } catch {
    return {} as NotificationOffsetsByEventId;
  }
}

export async function saveNotificationOffsets(
  map: NotificationOffsetsByEventId,
) {
  await AsyncStorage.setItem(NOTIFIED_EVENTS_STORAGE_KEY, JSON.stringify(map));
}

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  const parsed = safeParseObject(
    await AsyncStorage.getItem(WIDGET_SETTINGS_STORAGE_KEY),
  );

  return normalizeWidgetSettings(parsed);
}

export async function saveWidgetSettings(settings: WidgetSettings) {
  await AsyncStorage.setItem(
    WIDGET_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export async function loadDailyQuests() {
  const value = await AsyncStorage.getItem(DAILY_QUESTS_STORAGE);

  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as DailyQuestsSchema)
      : null;
  } catch {
    return null;
  }
}

export async function saveDailyQuests(quests: DailyQuestsSchema) {
  await AsyncStorage.setItem(DAILY_QUESTS_STORAGE, JSON.stringify(quests));
}
