import { SKY_ZONE } from "@/constants/common";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState } from "react";

export interface DailyQuest {
  /* Title for the quest */
  title: string;

  /*  The date this quest was saved on */
  date: string;

  /* Description for the quest (if any)*/
  description?: string;

  /* Image guide for the quest (if any) */
  images?: Array<{
    url: string;

    /* Credit for the guide */
    by: string;
    /* Source of the guide */
    source?: string;
  }>;
}

export interface DailyQuestsSchema {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
}

const pathUrl = "https://api.skyhelper.xyz" + "/update/quests";

export function isTodaysDate(dateStr: string) {
  const d = DateTime.fromISO(dateStr, { zone: SKY_ZONE });

  if (!d.isValid) return false;

  return d.hasSame(DateTime.now().setZone(SKY_ZONE), "day");
}

export function useDailyQuests() {
  const [quests, setQuests] = useState<DailyQuestsSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(pathUrl);
      if (!res.ok) throw new Error(`Failed to fetch quests: ${res.status}`);
      const json = (await res.json()) as DailyQuestsSchema;
      if (isTodaysDate(json.last_updated)) setQuests(json);
    } catch (e) {
      setError(e as Error);
      setQuests(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchQuests().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [fetchQuests]);

  return { quests, loading, error, refresh: fetchQuests } as const;
}
