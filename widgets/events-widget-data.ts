import {
  SkytimesUtils,
  type EventDetails,
  type EventKey,
} from "@skyhelperbot/utils";

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

function toGroupedEvent([key, event]: [EventKey, EventDetails]): GroupedEvent {
  return {
    key,
    event,
    status: getEventStatus(event.status),
    pinned: false,
    notified: false,
  };
}

export function getWidgetEventRows(
  events: Array<[EventKey, EventDetails]> = SkytimesUtils.allEventDetails(),
): WidgetEventRow[] {
  return events
    .map(toGroupedEvent)
    .sort(sortGroupedEvents)
    .slice(0, MAX_WIDGET_EVENTS)
    .map((item) => ({
      id: String(item.key),
      name: item.event.event.name,
      statusLabel:
        item.status === "active"
          ? "Active"
          : formatReadableTime(item.event.nextOccurence.toMillis()),
      active: item.status === "active",
    }));
}
