import { DateTime } from "luxon";
import { isClock24hEnabled } from "./hooks";

export function formatTime(ms: number, withSeconds = true) {
  const total = Math.max(0, Math.floor(ms / 1000));

  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts = [
    d && `${d}d`,
    h && `${h}h`,
    m && `${m}m`,
    s && withSeconds && `${s}s`,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : "0s";
}

export function formatToClock(date: DateTime, withSeconds = false) {
  const seconds = withSeconds ? ":ss" : "";
  return date
    .toLocal()
    .toFormat(isClock24hEnabled() ? `HH:mm${seconds}` : `hh:mm${seconds} a`);
}
