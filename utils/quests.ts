import { SKY_ZONE } from "@/constants/common";
import { DateTime } from "luxon";
import { create } from "zustand";

export interface DailyQuest {
  title: string;
  date: string;
  description?: string;
  images?: {
    url: string;
    by: string;
    source?: string;
  }[];
}

export interface DailyQuestsSchema {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
}

const pathUrl = "https://api.skyhelper.xyz/update/quests";

export function isTodaysDate(dateStr: string) {
  const d = DateTime.fromISO(dateStr, { zone: SKY_ZONE });

  if (!d.isValid) return false;

  return d.hasSame(DateTime.now().setZone(SKY_ZONE), "day");
}

export function getMediaType(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(cleanUrl)) return "image";
  if (/\.(mp4|webm|mov|avi|mkv)$/.test(cleanUrl)) return "video";

  return "unknown";
}

type DailyQuestsState = {
  quests: DailyQuestsSchema | null;
  loading: boolean;
  error: Error | null;
  fetchQuests: () => Promise<void>;
  clearQuests: () => void;
};

export const useDailyQuestsStore = create<DailyQuestsState>((set) => ({
  quests: null,
  loading: true,
  error: null,

  fetchQuests: async () => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(pathUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch quests: ${res.status}`);
      }

      const json = (await res.json()) as DailyQuestsSchema;

      set({
        quests: isTodaysDate(json.last_updated) ? json : null,
      });
    } catch (error) {
      set({
        quests: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } finally {
      set({ loading: false });
    }
  },

  clearQuests: () => set({ quests: null, error: null, loading: false }),
}));
