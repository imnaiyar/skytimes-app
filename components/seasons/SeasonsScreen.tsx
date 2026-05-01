import Colors from "@/constants/Colors";
import {
  buildSeasonBrowseList,
  getSkyGameDataSnapshot,
  type SeasonBrowseEntry,
  type SkyGameDataSnapshot,
} from "@/utils/sky-game-data";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../Themed";
import FAB from "../ui/DockedSearch";
import { useColorScheme } from "../useColorScheme";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; snapshot: SkyGameDataSnapshot };

export default function SeasonsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [searched, setSearched] = useState<SeasonBrowseEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSkyGameDataSnapshot()
      .then((snapshot) => {
        if (cancelled) return;
        setState({ status: "ready", snapshot });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load seasons right now.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const seasons = useMemo(
    () =>
      state.status === "ready"
        ? buildSeasonBrowseList(state.snapshot.data)
        : [],
    [state],
  );

  const onSearch = (value: string) => {
    if (value) setSearched(searchSeason(seasons, value));
    else setSearched(null);
  };

  const active = seasons.filter((season) => season.status === "active");
  const upcoming = seasons.filter((season) => season.status === "upcoming");
  const completed = seasons.filter((season) => season.status === "completed");

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        style={{ backgroundColor: themeColors.background }}
      >
        {state.status === "loading" && (
          <Text style={{ color: themeColors.mutedText }}>
            Loading seasons...
          </Text>
        )}

        {state.status === "error" && (
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: themeColors.eventRowB,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text>{state.message}</Text>
          </View>
        )}

        {state.status === "ready" && (
          <>
            {searched ? (
              <SeasonSection
                title="Search Result"
                items={searched}
                emptyContent="No results found the given search query!"
              />
            ) : (
              <>
                {!!active.length && (
                  <SeasonSection title="Current Season" items={active} />
                )}
                {!!upcoming.length && (
                  <SeasonSection title="Upcoming Seasons" items={upcoming} />
                )}
                {!!completed.length && (
                  <SeasonSection title="Past Seasons" items={completed} />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <FAB onQueryChange={onSearch} />
    </>
  );
}

function SeasonSection({
  title,
  items,
  emptyContent = "No items found!",
}: {
  title: string;
  items: SeasonBrowseEntry[];
  emptyContent?: string;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionItems}>
        {items.length ? (
          items.map((season) => (
            <Link key={season.guid} href={`/seasons/${season.guid}`} asChild>
              <Pressable>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.seasonCard,
                      {
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}
                  >
                    {!!season.imageUrl && (
                      <Image
                        source={season.imageUrl}
                        style={styles.seasonImage}
                        contentFit="cover"
                      />
                    )}

                    <View style={styles.seasonBody}>
                      <View style={styles.seasonTitleRow}>
                        <Text style={styles.seasonTitle}>{season.name}</Text>
                        <StatusPill status={season.status} />
                      </View>

                      <Text
                        style={[
                          styles.seasonSubtitle,
                          { color: themeColors.mutedText },
                        ]}
                      >
                        {formatSeasonRange(season.startsAt, season.endsAt)}
                      </Text>

                      <Text
                        style={[
                          styles.seasonMeta,
                          { color: themeColors.mutedText },
                        ]}
                      >
                        Season #{season.number} • {season.spiritCount} spirits
                        {season.includedTreeCount
                          ? ` • ${season.includedTreeCount} extra tree${season.includedTreeCount === 1 ? "" : "s"}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Link>
          ))
        ) : (
          <Text>{emptyContent}</Text>
        )}
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: SeasonBrowseEntry["status"] }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  const label =
    status === "active"
      ? "Live"
      : status === "upcoming"
        ? "Upcoming"
        : "Archived";

  const color =
    status === "active" ? themeColors.successSurface : themeColors.tint;

  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: color + "20", borderColor: color + "45" },
      ]}
    >
      <Text style={[styles.statusPillText, { color }]}>{label}</Text>
    </View>
  );
}

function formatSeasonRange(startsAt: number, endsAt: number) {
  return `${DateTime.fromMillis(startsAt).toFormat("LLL d, yyyy")} - ${DateTime.fromMillis(endsAt).toFormat("LLL d, yyyy")}`;
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: 16,
    paddingBottom: 108,
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  messageCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  seasonBody: {
    gap: 6,
    padding: 14,
  },
  seasonCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  seasonImage: {
    height: 120,
    width: "100%",
  },
  seasonMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  seasonSubtitle: {
    fontSize: 13,
  },
  seasonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  seasonTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionItems: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

function searchSeason(seasons: SeasonBrowseEntry[], query = "") {
  return seasons.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );
}
