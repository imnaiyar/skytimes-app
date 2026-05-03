import Colors from "@/constants/Colors";
import {
  getSeasonByGuid,
  getSkyGameDataSnapshot,
  type SkyGameDataSnapshot,
} from "@/utils/sky-game-data";
import type { ISeason, ISpiritTree } from "@skyhelperbot/skygame-data";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../Themed";
import { useColorScheme } from "../useColorScheme";
import SpiritTreeRenderer from "./SpiritTreeRenderer";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; snapshot: SkyGameDataSnapshot };

export default function SeasonDetailScreen({ seasonId }: { seasonId: string }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const [state, setState] = useState<LoadState>({ status: "loading" });

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
              : "Unable to load this season right now.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const season = useMemo(
    () =>
      state.status === "ready"
        ? getSeasonByGuid(state.snapshot.data, seasonId)
        : null,
    [seasonId, state],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: season?.shortName ?? "Season",
          presentation: "modal",
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        style={{ backgroundColor: themeColors.background }}
      >
        {state.status === "loading" && (
          <Text style={{ color: themeColors.mutedText }}>
            Loading season...
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

        {state.status === "ready" && !season && (
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: themeColors.eventRowB,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text>Season not found.</Text>
          </View>
        )}

        {season && <SeasonContent season={season} />}
      </ScrollView>
    </>
  );
}

function SeasonContent({ season }: { season: ISeason }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const startsAt = season.date.toMillis();
  const endsAt = season.endDate.toMillis();
  const now = Date.now();
  const seasonTrees = season.spirits.slice().sort((a, b) => {
    if (a.type === "Guide" && b.type !== "Guide") return -1;
    if (a.type !== "Guide" && b.type === "Guide") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: themeColors.eventRowA,
            borderColor: themeColors.border,
          },
        ]}
      >
        {!!season.imageUrl && (
          <Image
            source={season.imageUrl}
            style={styles.heroImage}
            contentFit="cover"
          />
        )}

        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{season.name}</Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.mutedText }]}>
            Season #{season.number} • {season.year}
          </Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.mutedText }]}>
            {DateTime.fromMillis(startsAt).toFormat("LLL d, yyyy")} -{" "}
            {DateTime.fromMillis(endsAt).toFormat("LLL d, yyyy")}
          </Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.mutedText }]}>
            {now >= startsAt && now < endsAt
              ? "Currently active"
              : now < startsAt
                ? "Starts in the future"
                : "Archived season"}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryStat label="Spirits" value={String(season.spirits.length)} />
        <SummaryStat
          label="Extra Trees"
          value={String(season.includedTrees?.length ?? 0)}
        />
        <SummaryStat label="Shops" value={String(season.shops?.length ?? 0)} />
      </View>

      <SectionTitle title="Season Spirits" />
      <View style={styles.cards}>
        {seasonTrees.map((spirit) => (
          <View
            key={spirit.guid}
            style={[
              styles.spiritCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.spiritHeader}>
              <View style={styles.spiritHeaderText}>
                <Text style={styles.spiritTitle}>{spirit.name}</Text>
                <Text
                  style={[styles.spiritMeta, { color: themeColors.mutedText }]}
                >
                  {spirit.type}
                  {spirit.area?.name ? ` • ${spirit.area.name}` : ""}
                </Text>
              </View>

              {!!spirit.imageUrl && (
                <Image
                  source={spirit.imageUrl}
                  style={styles.spiritImage}
                  contentFit="cover"
                />
              )}
            </View>

            <SpiritTreeRenderer tree={spirit.tree} />
          </View>
        ))}
      </View>

      {!!season.includedTrees?.length && (
        <>
          <SectionTitle title="Included Trees" />
          <View style={styles.cards}>
            {season.includedTrees.map((tree) => (
              <IncludedTreeCard key={tree.guid} tree={tree} />
            ))}
          </View>
        </>
      )}
    </>
  );
}

function IncludedTreeCard({ tree }: { tree: ISpiritTree }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.spiritCard,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <Text style={styles.spiritTitle}>
        {tree.spirit?.name ?? tree.name ?? "Included Tree"}
      </Text>
      {!!tree.spirit?.area?.name && (
        <Text style={[styles.spiritMeta, { color: themeColors.mutedText }]}>
          {tree.spirit.area.name}
        </Text>
      )}
      <SpiritTreeRenderer tree={tree} />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: themeColors.eventRowB,
          borderColor: themeColors.border,
        },
      ]}
    >
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: themeColors.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 16,
  },
  content: {
    gap: 18,
    padding: 16,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroBody: {
    gap: 6,
    padding: 18,
  },
  heroImage: {
    height: 180,
    width: "100%",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  messageCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  spiritCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  spiritHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  spiritHeaderText: {
    flex: 1,
    gap: 4,
  },
  spiritImage: {
    borderRadius: 14,
    height: 72,
    width: 72,
  },
  spiritMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  spiritTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 0,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
  },
});
