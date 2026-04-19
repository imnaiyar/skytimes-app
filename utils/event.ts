import { EventCategory } from "@/constants/common";
import type { EventDetails, EventKey, Times } from "@skyhelperbot/utils";
import type { NotificationOffsetsByEventId } from "./storage";

export type EventStatus = "active" | "upcoming";
export type GroupedEvent = {
  key: EventKey;
  event: EventDetails;
  status: EventStatus;
  pinned: boolean;
  notified: boolean;
  notificationOffsetMinutes?: number;
};

export function getEventStatus(event: Times): EventStatus {
  if (event.active) return "active";
  return "upcoming";
}

export function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));

  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts = [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(
    Boolean,
  );

  return parts.length ? parts.join(" ") : "0s";
}

function getSortPriority(status: EventStatus, pinned: boolean) {
  if (status === "active" && pinned) return 0;
  if (status === "active") return 1;
  if (pinned) return 2;
  return 3;
}

export function sortGroupedEvents(a: GroupedEvent, b: GroupedEvent) {
  const priority =
    getSortPriority(a.status, a.pinned) - getSortPriority(b.status, b.pinned);
  if (priority !== 0) return priority;

  const timeA =
    a.status === "active"
      ? (a.event.status.endTime ?? a.event.nextOccurence).toMillis()
      : a.event.nextOccurence.toMillis();
  const timeB =
    b.status === "active"
      ? (b.event.status.endTime ?? b.event.nextOccurence).toMillis()
      : b.event.nextOccurence.toMillis();

  if (timeA !== timeB) return timeA - timeB;
  return a.event.event.name.localeCompare(b.event.event.name);
}

export function groupEvents(
  events: Array<[EventKey, EventDetails]>,
  pinnedKeys: Set<EventKey>,
  notificationOffsetsById: NotificationOffsetsByEventId,
) {
  const mappedEvents = events.map(([key, event]) => {
    const status = getEventStatus(event.status);
    const pinned = pinnedKeys.has(key);
    const notificationOffsetMinutes = notificationOffsetsById[String(key)];
    const notified = typeof notificationOffsetMinutes === "number";

    return { key, event, status, pinned, notified, notificationOffsetMinutes };
  });

  return Object.entries(EventCategory).reduce(
    (acc, next) => {
      acc[next[0]] = mappedEvents
        .filter((e) => next[1].includes(e.key))
        .sort(sortGroupedEvents);
      return acc;
    },
    {} as Record<string, GroupedEvent[]>,
  );
}
