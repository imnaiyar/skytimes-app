import { useThemeColor } from "@/constants/Colors";
import {
  buildSeasonBrowseList,
  getSkyGameDataSnapshot,
  type SeasonBrowseEntry,
  type SkyGameDataSnapshot,
} from "@/utils/sky-game-data";
import {
  Box,
  Column,
  Host,
  LazyColumn,
  OutlinedCard,
  RNHostView,
  Row,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  Shapes,
  background,
  border,
  clickable,
  clip,
  fillMaxHeight,
  fillMaxWidth,
  height,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import FAB from "../ui/DockedSearch";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; snapshot: SkyGameDataSnapshot };

export default function SeasonsScreen() {
  const themeColors = useThemeColor();
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

  const active = seasons.filter((season) => season.status === "active");
  const upcoming = seasons.filter((season) => season.status === "upcoming");
  const completed = seasons.filter((season) => season.status === "completed");

  const onSearch = (value: string) => {
    if (value) setSearched(searchSeason(seasons, value));
    else setSearched(null);
  };

  return (
    <>
      <Host style={{ flex: 1, backgroundColor: themeColors.background }}>
        <LazyColumn
          contentPadding={{ top: 16, end: 16, bottom: 108, start: 16 }}
        >
          <Column verticalArrangement={{ spacedBy: 18 }}>
            {state.status === "loading" && (
              <Text color={themeColors.mutedText}>Loading seasons...</Text>
            )}

            {state.status === "error" && (
              <Box
                modifiers={[
                  fillMaxWidth(),
                  background(themeColors.eventRowB),
                  border(1, themeColors.border),
                  clip(Shapes.RoundedCorner(18)),
                  paddingAll(16),
                ]}
              >
                <Text color={themeColors.text}>{state.message}</Text>
              </Box>
            )}

            {state.status === "ready" &&
              (searched ? (
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
              ))}
          </Column>
        </LazyColumn>
      </Host>

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
  const themeColors = useThemeColor();

  return (
    <Column verticalArrangement={{ spacedBy: 10 }} modifiers={[fillMaxWidth()]}>
      <Text
        color={themeColors.text}
        style={{ typography: "titleMedium", fontWeight: "800" }}
      >
        {title}
      </Text>

      <Column
        verticalArrangement={{ spacedBy: 12 }}
        modifiers={[fillMaxWidth()]}
      >
        {items.length ? (
          items.map((season) => (
            <SeasonCard key={season.guid} season={season} />
          ))
        ) : (
          <Text color={themeColors.text}>{emptyContent}</Text>
        )}
      </Column>
    </Column>
  );
}

function SeasonCard({ season }: { season: SeasonBrowseEntry }) {
  const themeColors = useThemeColor();
  const router = useRouter();

  return (
    <OutlinedCard
      colors={{ containerColor: themeColors.card }}
      border={{ width: 1, color: themeColors.border }}
      modifiers={[
        fillMaxWidth(),
        height(120),
        clickable(() => router.push(`/seasons/${season.guid}`)),
      ]}
    >
      <Row horizontalArrangement={"spaceBetween"} modifiers={[fillMaxWidth()]}>
        <Column
          verticalArrangement={{ spacedBy: 6 }}
          modifiers={[weight(1), paddingAll(14)]}
        >
          <Text
            color={themeColors.text}
            softWrap
            style={{ fontSize: 16, fontWeight: "bold" }}
          >
            {season.name}
          </Text>

          <Text color={themeColors.mutedText} style={{ fontSize: 13 }}>
            {formatSeasonRange(season.startsAt, season.endsAt)}
          </Text>

          <Text
            color={themeColors.mutedText}
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            {formatSeasonMeta(season)}
          </Text>
        </Column>
        <Column
          modifiers={[clickable(() => router.push(`/seasons/${season.guid}`))]}
        >
          {!!season.imageUrl && (
            <RNHostView
              matchContents
              modifiers={[
                clickable(() => router.push(`/seasons/${season.guid}`)),
                fillMaxHeight(),
              ]}
            >
              <Image
                source={season.imageUrl}
                style={styles.seasonImage}
                contentFit={"cover"}
                pointerEvents="box-none"
              />
            </RNHostView>
          )}
        </Column>
      </Row>
    </OutlinedCard>
  );
}

function formatSeasonRange(startsAt: number, endsAt: number) {
  return `${DateTime.fromMillis(startsAt).toFormat("LLL d, yyyy")} - ${DateTime.fromMillis(endsAt).toFormat("LLL d, yyyy")}`;
}

function formatSeasonMeta(season: SeasonBrowseEntry) {
  return `Season #${season.number} • ${season.spiritCount} spirits${
    season.includedTreeCount
      ? ` • ${season.includedTreeCount} extra tree${season.includedTreeCount === 1 ? "" : "s"}`
      : ""
  }`;
}

function searchSeason(seasons: SeasonBrowseEntry[], query = "") {
  return seasons.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );
}

const styles = StyleSheet.create({
  seasonImage: {
    height: 120,
    width: 120,
  },
});
