import { SKY_ZONE } from "@/constants/common";
import { loadDailyQuests, saveDailyQuests } from "@/utils/storage";
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
  fetchQuests: (options?: { refresh?: boolean }) => Promise<void>;
  clearQuests: () => void;
};

export const useDailyQuestsStore = create<DailyQuestsState>((set, get) => ({
  quests: null,
  loading: true,
  error: null,

  fetchQuests: async ({ refresh = false } = {}) => {
    const cached = await loadDailyQuests();

    const cachedQuests =
      cached && isTodaysDate(cached.last_updated) ? cached : null;

    if (!refresh && cachedQuests) {
      set({ quests: cachedQuests, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await fetch(pathUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch quests: ${res.status}`);
      }

      const json = (await res.json()) as DailyQuestsSchema;

      if (isTodaysDate(json.last_updated)) {
        await saveDailyQuests(json);
        set({ quests: json, error: null });
      } else {
        set({
          quests: cachedQuests ?? null,
          error: null,
        });
      }
    } catch (error) {
      set({
        quests: cachedQuests ?? null,
        error: cachedQuests
          ? null
          : error instanceof Error
            ? error
            : new Error("Unknown error"),
      });
    } finally {
      set({ loading: false });
    }
  },

  clearQuests: () => set({ quests: null, error: null, loading: false }),
}));
