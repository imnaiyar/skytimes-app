import { SkytimesUtils, type EventDetails } from "@skyhelperbot/utils";

import type { GroupedEvent } from "@/utils/event";
import { getEventStatus, sortGroupedEvents } from "@/utils/event";

import { MAX_WIDGET_EVENTS } from "./constants";

export type WidgetEventRow = {
  id: string;
  name: string;
  statusLabel: string;
  active: boolean;
};

const formatReadableTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function toGroupedEvent(event: EventDetails): GroupedEvent {
  return {
    key: event.key,
    event,
    status: getEventStatus(event.status),
    pinned: false,
    notified: false,
  };
}

export function getWidgetEventRows(
  events: EventDetails[] = SkytimesUtils.allEventDetails(),
  selectedEventKeys?: string[],
): WidgetEventRow[] {
  let mapped = events.map(toGroupedEvent).sort(sortGroupedEvents);

  if (selectedEventKeys && selectedEventKeys.length > 0) {
    const selectedSet = new Set(selectedEventKeys.map(String));
    mapped = mapped.filter((item) => selectedSet.has(String(item.key)));
  }

  return mapped.slice(0, MAX_WIDGET_EVENTS).map((item) => ({
    id: String(item.key),
    name: item.event.event.name,
    statusLabel:
      item.status === "active"
        ? "Active"
        : formatReadableTime(item.event.nextOccurence.toMillis()),
    active: item.status === "active",
  }));
}
