import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SkyDataResolver,
  type IEventInstance,
  type ISeason,
  type ISkyData,
  type ISpecialVisit,
  type ITravelingSpirit,
} from "@skyhelperbot/skygame-data";

const SKYGAME_DATA_URL =
  "https://unpkg.com/skygame-data@1.x.x/assets/everything.json";
const SKYGAME_DATA_CACHE_KEY = "skygame-data:everything:v1";
const SKYGAME_DATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type SkyGameDataCache = {
  fetchedAt: number;
  raw: string;
};

export type SkyGameDataSnapshot = {
  data: ISkyData;
  fetchedAt: number;
  source: "memory" | "cache" | "stale-cache" | "network";
};

export type SkyTimedStatus = "active" | "upcoming";

export type SkyTimedEntry = {
  id: string;
  title: string;
  subtitle?: string;
  details?: string;
  status: SkyTimedStatus;
  startsAt: number;
  endsAt: number;
};

export type SkyGameOverview = {
  seasons: SkyTimedEntry[];
  specialEvents: SkyTimedEntry[];
  travelingSpirits: SkyTimedEntry[];
  specialVisits: SkyTimedEntry[];
};

export type SeasonBrowseStatus = "active" | "upcoming" | "completed";

export type SeasonBrowseEntry = {
  guid: string;
  name: string;
  shortName: string;
  year: number;
  number: number;
  iconUrl?: string;
  imageUrl?: string;
  imagePosition?: string;
  spiritCount: number;
  includedTreeCount: number;
  startsAt: number;
  endsAt: number;
  status: SeasonBrowseStatus;
  draft?: boolean;
};

let memorySnapshot: SkyGameDataSnapshot | null = null;
let inflightSnapshotPromise: Promise<SkyGameDataSnapshot> | null = null;

function isFresh(fetchedAt: number) {
  return Date.now() - fetchedAt < SKYGAME_DATA_CACHE_TTL_MS;
}

function parseResolvedSkyData(raw: string) {
  return SkyDataResolver.resolve(SkyDataResolver.parse(raw));
}

async function readCachedSnapshot() {
  const rawValue = await AsyncStorage.getItem(SKYGAME_DATA_CACHE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<SkyGameDataCache>;
    if (
      typeof parsed?.fetchedAt !== "number" ||
      typeof parsed?.raw !== "string"
    ) {
      return null;
    }

    return parsed as SkyGameDataCache;
  } catch {
    return null;
  }
}

async function saveCachedSnapshot(cache: SkyGameDataCache) {
  await AsyncStorage.setItem(SKYGAME_DATA_CACHE_KEY, JSON.stringify(cache));
}

async function fetchRemoteSnapshot() {
  const response = await fetch(SKYGAME_DATA_URL);
  if (!response.ok) {
    throw new Error(`SkyGame data request failed with ${response.status}`);
  }

  const raw = await response.text();
  const fetchedAt = Date.now();
  const data = parseResolvedSkyData(raw);

  await saveCachedSnapshot({ fetchedAt, raw });

  return {
    data,
    fetchedAt,
    source: "network",
  } satisfies SkyGameDataSnapshot;
}

export async function getSkyGameDataSnapshot(forceRefresh = false) {
  if (!forceRefresh && memorySnapshot && isFresh(memorySnapshot.fetchedAt)) {
    return {
      ...memorySnapshot,
      source: "memory",
    } satisfies SkyGameDataSnapshot;
  }

  if (!forceRefresh && inflightSnapshotPromise) {
    return inflightSnapshotPromise;
  }

  const loadPromise = (async () => {
    const cached = await readCachedSnapshot();

    if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
      const snapshot = {
        data: parseResolvedSkyData(cached.raw),
        fetchedAt: cached.fetchedAt,
        source: "cache",
      } satisfies SkyGameDataSnapshot;
      memorySnapshot = snapshot;
      return snapshot;
    }

    try {
      const snapshot = await fetchRemoteSnapshot();
      memorySnapshot = snapshot;
      return snapshot;
    } catch (error) {
      if (cached) {
        const snapshot = {
          data: parseResolvedSkyData(cached.raw),
          fetchedAt: cached.fetchedAt,
          source: "stale-cache",
        } satisfies SkyGameDataSnapshot;
        memorySnapshot = snapshot;
        return snapshot;
      }

      throw error;
    } finally {
      inflightSnapshotPromise = null;
    }
  })();

  inflightSnapshotPromise = loadPromise;
  return loadPromise;
}

function toStatus(
  startsAt: number,
  endsAt: number,
  now: number,
): SkyTimedStatus | null {
  if (startsAt <= now && endsAt > now) return "active";
  if (startsAt > now) return "upcoming";
  return null;
}

function sortEntries(a: SkyTimedEntry, b: SkyTimedEntry) {
  if (a.status !== b.status) {
    return a.status === "active" ? -1 : 1;
  }

  if (a.status === "active") {
    return a.endsAt - b.endsAt;
  }

  return a.startsAt - b.startsAt;
}

function getSeasonBrowseStatus(
  startsAt: number,
  endsAt: number,
  now: number,
): SeasonBrowseStatus {
  if (startsAt <= now && endsAt > now) return "active";
  if (startsAt > now) return "upcoming";
  return "completed";
}

function compareSeasonBrowseEntries(
  a: SeasonBrowseEntry,
  b: SeasonBrowseEntry,
) {
  const rank = {
    active: 0,
    upcoming: 1,
    completed: 2,
  } satisfies Record<SeasonBrowseStatus, number>;

  if (rank[a.status] !== rank[b.status]) {
    return rank[a.status] - rank[b.status];
  }

  if (a.status === "completed") {
    return b.endsAt - a.endsAt;
  }

  return a.startsAt - b.startsAt;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function buildSeasonEntry(item: ISeason, now: number): SkyTimedEntry | null {
  const startsAt = item.date.toMillis();
  const endsAt = item.endDate.toMillis();
  const status = toStatus(startsAt, endsAt, now);
  if (!status) return null;

  return {
    id: item.guid,
    title: item.name,
    subtitle:
      item.spirits.length === 1
        ? "1 spirit in this season"
        : `${item.spirits.length} spirits in this season`,
    details: `${item.shortName} • ${item.year}`,
    status,
    startsAt,
    endsAt,
  };
}

function buildEventEntry(
  item: IEventInstance,
  now: number,
): SkyTimedEntry | null {
  const startsAt = item.date.toMillis();
  const endsAt = item.endDate.toMillis();
  const status = toStatus(startsAt, endsAt, now);
  if (!status) return null;

  const title = item.name ?? item.event.name;
  const spiritCount = item.spirits?.length ?? 0;

  return {
    id: item.guid,
    title,
    subtitle: title === item.event.name ? undefined : item.event.name,
    details:
      spiritCount > 0
        ? `${spiritCount} featured spirit${spiritCount === 1 ? "" : "s"}`
        : undefined,
    status,
    startsAt,
    endsAt,
  };
}

function buildTravelingSpiritEntry(
  item: ITravelingSpirit,
  now: number,
): SkyTimedEntry | null {
  const startsAt = item.date.toMillis();
  const endsAt = item.endDate.toMillis();
  const status = toStatus(startsAt, endsAt, now);
  if (!status) return null;

  return {
    id: item.guid,
    title: item.spirit.name,
    subtitle: `Traveling Spirit #${item.number}`,
    details: `Visit ${item.visit}`,
    status,
    startsAt,
    endsAt,
  };
}

function buildSpecialVisitEntry(
  item: ISpecialVisit,
  now: number,
): SkyTimedEntry | null {
  const startsAt = item.date.toMillis();
  const endsAt = item.endDate.toMillis();
  const status = toStatus(startsAt, endsAt, now);
  if (!status) return null;

  const previewSpirits = item.spirits
    .slice(0, 3)
    .map((spirit) => spirit.spirit.name)
    .join(", ");
  const remainingSpirits =
    item.spirits.length - Math.min(item.spirits.length, 3);

  return {
    id: item.guid,
    title: item.name ?? "Special Visit",
    subtitle: item.area?.name ? `Area: ${item.area.name}` : undefined,
    details:
      previewSpirits.length > 0
        ? remainingSpirits > 0
          ? `${previewSpirits} +${remainingSpirits} more`
          : previewSpirits
        : undefined,
    status,
    startsAt,
    endsAt,
  };
}

export function buildSkyGameOverview(data: ISkyData, now = Date.now()) {
  return {
    seasons: data.seasons.items
      .map((item) => buildSeasonEntry(item, now))
      .filter(isDefined)
      .sort(sortEntries),
    specialEvents: data.eventInstances.items
      .map((item) => buildEventEntry(item, now))
      .filter(isDefined)
      .sort(sortEntries),
    travelingSpirits: data.travelingSpirits.items
      .map((item) => buildTravelingSpiritEntry(item, now))
      .filter(isDefined)
      .sort(sortEntries),
    specialVisits: data.specialVisits.items
      .map((item) => buildSpecialVisitEntry(item, now))
      .filter(isDefined)
      .sort(sortEntries),
  } satisfies SkyGameOverview;
}

export function buildSeasonBrowseList(data: ISkyData, now = Date.now()) {
  return data.seasons.items
    .map((season) => {
      const startsAt = season.date.toMillis();
      const endsAt = season.endDate.toMillis();

      return {
        guid: season.guid,
        name: season.name,
        shortName: season.shortName,
        year: season.year,
        number: season.number,
        iconUrl: season.iconUrl,
        imageUrl: season.imageUrl,
        imagePosition: season.imagePosition,
        spiritCount: season.spirits.length,
        includedTreeCount: season.includedTrees?.length ?? 0,
        startsAt,
        endsAt,
        status: getSeasonBrowseStatus(startsAt, endsAt, now),
        draft: season.draft,
      } satisfies SeasonBrowseEntry;
    })
    .sort(compareSeasonBrowseEntries);
}

export function getSeasonByGuid(data: ISkyData, guid: string) {
  return data.seasons.items.find((season) => season.guid === guid) ?? null;
}
