import Colors from "@/constants/Colors";
import { SKY_ZONE } from "@/constants/common";
import { useNow } from "@/utils/hooks";
import {
  buildSkyGameOverview,
  getSkyGameDataSnapshot,
  type SkyGameDataSnapshot,
  type SkyTimedEntry,
} from "@/utils/sky-game-data";
import { formatTime, formatToClock } from "@/utils/time";
import { EvilIcons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Collapsible } from "react-native-fast-collapsible";
import { Text, View } from "../Themed";
import { AnimatedChevron } from "../ui/AnimatedChevron";
import { useColorScheme } from "../useColorScheme";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; snapshot: SkyGameDataSnapshot };

const EMPTY_MESSAGE =
  "No active or upcoming items found in the current SkyGame data.";

export default function SkyGameDataSections() {
  const now = useNow();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const overview = useMemo(
    () =>
      state.status === "ready"
        ? buildSkyGameOverview(state.snapshot.data, now)
        : null,
    [now, state],
  );

  useEffect(() => {
    let cancelled = false;

    getSkyGameDataSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        setState({
          status: "ready",
          snapshot,
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load SkyGame data.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <InfoCard title="SkyGame Data">
        Loading seasons and special events...
      </InfoCard>
    );
  }

  if (state.status === "error") {
    return <InfoCard title="SkyGame Data">{state.message}</InfoCard>;
  }

  return (
    <>
      <Link href="/seasons" asChild>
        <Pressable
          style={({ hovered, pressed }) => [
            styles.archiveCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              opacity: pressed ? 0.88 : 1,
            },
            hovered && { backgroundColor: themeColors.eventRowB },
          ]}
        >
          <View style={{ flex: 1, gap: 6, backgroundColor: "transparent" }}>
            <Text style={styles.archiveTitle}>Season Archive</Text>
            <Text style={{ color: themeColors.mutedText }}>
              Browse every season and open full spirit tree details.
            </Text>
          </View>
          <AnimatedChevron
            isCollapsed
            color={themeColors.text}
            duration={0}
            size={16}
          />
        </Pressable>
      </Link>

      {overview?.seasons.length && (
        <TimedSection
          title="Seasons"
          items={overview?.seasons ?? []}
          emptyMessage={EMPTY_MESSAGE}
          getHref={(item) => `/seasons/${item.id}`}
        />
      )}
      {overview?.specialEvents.length && (
        <TimedSection
          title="Special Events"
          items={overview?.specialEvents ?? []}
          emptyMessage={EMPTY_MESSAGE}
        />
      )}
      {overview?.travelingSpirits.length && (
        <TimedSection
          title="Traveling Spirits"
          items={overview?.travelingSpirits ?? []}
          emptyMessage={EMPTY_MESSAGE}
        />
      )}
      {overview?.specialVisits.length && (
        <TimedSection
          title="Special Visits"
          items={overview?.specialVisits ?? []}
          emptyMessage={EMPTY_MESSAGE}
        />
      )}
    </>
  );
}

function TimedSection({
  title,
  items,
  emptyMessage,
  getHref,
}: {
  title: string;
  items: SkyTimedEntry[];
  emptyMessage: string;
  getHref?: (item: SkyTimedEntry) => Href;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <Pressable
        onPress={() => setCollapsed(!collapsed)}
        style={(state) => [
          styles.sectionHeader,
          {
            backgroundColor:
              state.hovered || state.pressed
                ? themeColors.overlay
                : themeColors.card,
          },
        ]}
      >
        <Text style={styles.sectionTitle}>
          {title} ({items.length})
        </Text>
        <AnimatedChevron
          isCollapsed={collapsed}
          color={themeColors.text}
          duration={200}
          size={16}
        />
      </Pressable>

      <Collapsible duration={200} isVisible={!collapsed}>
        {items.length ? (
          items.map((item, index) => (
            <View key={item.id} style={{ backgroundColor: "transparent" }}>
              <TimedRow item={item} index={index} href={getHref?.(item)} />
              {index + 1 < items.length && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: themeColors.divider },
                  ]}
                />
              )}
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: themeColors.mutedText }]}>
            {emptyMessage}
          </Text>
        )}
      </Collapsible>
    </View>
  );
}

function TimedRow({
  item,
  index,
  href,
}: {
  item: SkyTimedEntry;
  index: number;
  href?: Href;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const now = useNow();
  const rowColors = [themeColors.eventRowA, themeColors.eventRowB];

  const targetMs = item.status === "active" ? item.endsAt : item.startsAt;
  const actionLabel = item.status === "active" ? "Ends" : "Starts";
  const absoluteDate = DateTime.fromMillis(targetMs, { zone: SKY_ZONE })
    .toLocal()
    .toFormat("MMM d");
  const absoluteTime = formatToClock(
    DateTime.fromMillis(targetMs, { zone: SKY_ZONE }),
  );
  const relativeTime = formatTime(targetMs - now, false);
  const content = (
    <View
      style={[
        styles.row,
        { backgroundColor: rowColors[index % rowColors.length] },
      ]}
    >
      <View style={{ flex: 1, backgroundColor: "transparent", gap: 3 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            backgroundColor: "transparent",
          }}
        >
          <Text
            style={[
              styles.rowTitle,
              item.status === "active" && { color: themeColors.successSurface },
            ]}
          >
            {item.title}
          </Text>
          <EvilIcons name="arrow-right" color={themeColors.icon} size={22} />
        </View>

        {!!item.subtitle && (
          <Text style={[styles.rowSubtitle, { color: themeColors.mutedText }]}>
            {item.subtitle}
          </Text>
        )}

        <Text
          style={[
            styles.rowTimer,
            item.status === "active" && { color: themeColors.successSurface },
          ]}
        >
          {actionLabel} {absoluteDate} at {absoluteTime} (in {relativeTime})
        </Text>

        {!!item.details && (
          <Text style={[styles.rowDetails, { color: themeColors.mutedText }]}>
            {item.details}
          </Text>
        )}
      </View>
    </View>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.86 : 1 }}>{content}</View>
        )}
      </Pressable>
    </Link>
  );
}

function InfoCard({ title, children }: { title: string; children: string }) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={[styles.infoText, { color: themeColors.mutedText }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  archiveCard: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  archiveTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  separator: {
    height: 1.15,
    width: "100%",
  },
  row: {
    padding: 10,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  rowSubtitle: {
    fontSize: 11,
  },
  rowTimer: {
    fontSize: 12,
    fontWeight: "600",
  },
  rowDetails: {
    fontSize: 11,
  },
  badge: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyText: {
    padding: 10,
    fontSize: 12,
  },
  infoTitle: {
    paddingHorizontal: 10,
    paddingTop: 10,
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    padding: 10,
    fontSize: 12,
  },
});
