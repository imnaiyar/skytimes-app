import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EventDetails } from "@skyhelperbot/utils";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type {
  NotificationOffsetsByEventId,
  NotificationSettings,
} from "./storage";

const SCHEDULED_NOTIFICATIONS_STORAGE_KEY = "notifications:scheduled";
const NOTIFICATION_SOURCE = "game-app-event";
const ANDROID_CHANNEL_ID = "sky-event-reminders" + (__DEV__ ? "-dev" : "");

export type NotificationEvent = {
  id: string;
  name: string;
  startAtMs: number;
};

type ScheduledEventNotifications = {
  eventId: string;
  startAtMs: number;
  reminderOffsetMinutes: number;
  soundEnabled: boolean;
  reminderNotificationId?: string;
  activeNotificationId?: string;
};

type ScheduledMap = Record<string, ScheduledEventNotifications>;

function isNativePlatform() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

function toNotificationEvent(event: EventDetails): NotificationEvent {
  return {
    id: String(event.key),
    name: event.event.name,
    startAtMs: event.nextOccurence,
  };
}

function toNormalizedOffsetsById(offsetsById: NotificationOffsetsByEventId) {
  return Object.entries(offsetsById).reduce<Record<string, number>>(
    (acc, [eventId, value]) => {
      if (typeof value !== "number") return acc;
      acc[String(eventId)] = value;
      return acc;
    },
    {},
  );
}

async function loadScheduledMap() {
  const raw = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_STORAGE_KEY);
  if (!raw) return {} as ScheduledMap;

  try {
    const parsed = JSON.parse(raw) as ScheduledMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as ScheduledMap;
  }
}

async function saveScheduledMap(map: ScheduledMap) {
  await AsyncStorage.setItem(
    SCHEDULED_NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(map),
  );
}

async function requestNotificationPermissions() {
  if (!isNativePlatform()) return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Event reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function scheduleReminderNotification(
  event: NotificationEvent,
  offsetMinutes: number,
  soundEnabled: boolean,
) {
  const triggerAtMs = event.startAtMs - offsetMinutes * 60_000;

  if (triggerAtMs <= Date.now()) return undefined;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Event reminder",
      body: `${event.name} starts in ${offsetMinutes} minutes.`,
      sound: soundEnabled,
      data: {
        source: NOTIFICATION_SOURCE,
        kind: "reminder",
        eventId: event.id,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
      date: triggerAtMs,
    },
  });
}

async function scheduleActiveNotification(
  event: NotificationEvent,
  soundEnabled: boolean,
) {
  if (event.startAtMs <= Date.now()) return undefined;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Event is active",
      body: `${event.name} is active now.`,
      sound: soundEnabled,
      data: { source: NOTIFICATION_SOURCE, kind: "active", eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
      date: new Date(event.startAtMs),
    },
  });
}

async function cleanupOrphanedScheduledNotifications(map: ScheduledMap) {
  if (!isNativePlatform()) return;

  const all = await Notifications.getAllScheduledNotificationsAsync();
  const knownIds = new Set(
    Object.values(map).flatMap((entry) =>
      [entry.reminderNotificationId, entry.activeNotificationId].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  );

  const orphans = all
    .filter(
      (item) =>
        item.content.data?.source === NOTIFICATION_SOURCE &&
        !knownIds.has(item.identifier),
    )
    .map((item) => item.identifier);

  await Promise.all(
    orphans.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

function matchesEntry(
  entry: ScheduledEventNotifications | undefined,
  event: NotificationEvent,
  offsetMinutes: number,
  soundEnabled: boolean,
) {
  return (
    !!entry &&
    entry.startAtMs === event.startAtMs &&
    entry.reminderOffsetMinutes === offsetMinutes &&
    entry.soundEnabled === soundEnabled
  );
}

export async function initializeNotifications() {
  if (!isNativePlatform()) return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  await ensureAndroidChannel();
  return requestNotificationPermissions();
}

export async function scheduleEventNotification(
  event: NotificationEvent,
  offsetMinutes: number,
  options: Pick<NotificationSettings, "enabled" | "soundEnabled"> = {
    enabled: true,
    soundEnabled: true,
  },
) {
  if (!isNativePlatform()) return null;

  const map = await loadScheduledMap();
  if (map[event.id]) {
    await cancelEventNotification(event.id);
  }

  if (!options.enabled) {
    delete map[event.id];
    await saveScheduledMap(map);
    return null;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  await ensureAndroidChannel();

  const reminderNotificationId = await scheduleReminderNotification(
    event,
    offsetMinutes,
    options.soundEnabled,
  );
  const activeNotificationId = await scheduleActiveNotification(
    event,
    options.soundEnabled,
  );

  const nextEntry: ScheduledEventNotifications = {
    eventId: event.id,
    startAtMs: event.startAtMs,
    reminderOffsetMinutes: offsetMinutes,
    soundEnabled: options.soundEnabled,
    reminderNotificationId,
    activeNotificationId,
  };

  map[event.id] = nextEntry;
  await saveScheduledMap(map);
  return nextEntry;
}

export async function cancelEventNotification(eventId: string) {
  if (!isNativePlatform()) return;

  const map = await loadScheduledMap();
  const scheduled = map[eventId];
  if (!scheduled) return;

  const ids = [
    scheduled.reminderNotificationId,
    scheduled.activeNotificationId,
  ].filter((id): id is string => Boolean(id));

  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  delete map[eventId];
  await saveScheduledMap(map);
}

export async function resyncAllNotifications(
  events: EventDetails[],
  settings: NotificationSettings,
  notificationOffsetsById: NotificationOffsetsByEventId,
) {
  if (!isNativePlatform()) return;

  const normalizedOffsetsById = toNormalizedOffsetsById(
    notificationOffsetsById,
  );
  const selectedIds = new Set(Object.keys(normalizedOffsetsById));
  const normalized = events
    .map(toNotificationEvent)
    .filter((event) => selectedIds.has(event.id));
  const eventIds = new Set(normalized.map((event) => event.id));
  const map = await loadScheduledMap();

  const removedIds = Object.keys(map).filter(
    (eventId) => !eventIds.has(eventId),
  );
  await Promise.all(
    removedIds.map((eventId) => cancelEventNotification(eventId)),
  );

  for (const event of normalized) {
    const offsetMinutes = normalizedOffsetsById[event.id];
    if (typeof offsetMinutes !== "number") continue;

    if (!settings.enabled) {
      if (map[event.id]) {
        await scheduleEventNotification(event, offsetMinutes, {
          enabled: false,
          soundEnabled: settings.soundEnabled,
        });
      }
      continue;
    }

    const current = map[event.id];
    if (matchesEntry(current, event, offsetMinutes, settings.soundEnabled))
      continue;

    await scheduleEventNotification(event, offsetMinutes, {
      enabled: settings.enabled,
      soundEnabled: settings.soundEnabled,
    });
  }

  await cleanupOrphanedScheduledNotifications(await loadScheduledMap());
}

export async function syncNotifications(
  events: EventDetails[],
  notificationOffsetsById: NotificationOffsetsByEventId,
  settings: NotificationSettings,
) {
  if (!isNativePlatform()) return;

  const normalizedOffsetsById = toNormalizedOffsetsById(
    notificationOffsetsById,
  );
  const selectedIds = new Set(Object.keys(normalizedOffsetsById));
  const normalized = events
    .map(toNotificationEvent)
    .filter((event) => selectedIds.has(event.id));
  const nextById = new Map(normalized.map((event) => [event.id, event]));
  const previous = await loadScheduledMap();

  const removedIds = Object.keys(previous).filter(
    (eventId) => !nextById.has(eventId),
  );
  if (removedIds.length) {
    await Promise.all(
      removedIds.map((eventId) => cancelEventNotification(eventId)),
    );
  }

  for (const event of normalized) {
    const offsetMinutes = normalizedOffsetsById[event.id];
    if (typeof offsetMinutes !== "number") continue;

    if (!settings.enabled) {
      if (previous[event.id]) {
        await scheduleEventNotification(event, offsetMinutes, {
          enabled: false,
          soundEnabled: settings.soundEnabled,
        });
      }
      continue;
    }

    const existing = previous[event.id];
    if (matchesEntry(existing, event, offsetMinutes, settings.soundEnabled))
      continue;

    await scheduleEventNotification(event, offsetMinutes, {
      enabled: settings.enabled,
      soundEnabled: settings.soundEnabled,
    });
  }
}
