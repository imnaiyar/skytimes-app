import { QuestCard } from "@/components/quests/QuestCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import {
  Card,
  CircularWavyProgressIndicator,
  Column,
  Host,
  LazyColumn,
  PullToRefreshBox,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { DateTime } from "luxon";
import { useEffect } from "react";

export default function Quests() {
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();
  const themeColor = Colors[useColorScheme() ?? "dark"];

  useEffect(() => {
    // fetch quests at least once
    fetchQuests();
  }, [fetchQuests]);

  const hasQuests = Boolean(quests?.quests?.length);

  return (
    <Host style={{ flex: 1 }}>
      <PullToRefreshBox
        contentAlignment="topCenter"
        indicator={{
          color: themeColor.iconMuted,
          containerColor: themeColor.overlay,
        }}
        isRefreshing={loading}
        onRefresh={fetchQuests}
      >
        <LazyColumn modifiers={[fillMaxHeight(), padding(5, 5, 5, 5)]}>
          {error ? (
            <Text
              color={themeColor.danger}
              style={{ typography: "bodyMedium" }}
              modifiers={[paddingAll(8)]}
            >
              /{error.message}
            </Text>
          ) : loading && !quests ? (
            <Column
              modifiers={[weight(1), paddingAll(24)]}
              horizontalAlignment="center"
            >
              <CircularWavyProgressIndicator color={themeColor.tint} />
            </Column>
          ) : hasQuests ? (
            <Card
              modifiers={[weight(1)]}
              border={{ color: themeColor.border, width: 1 }}
              colors={{ containerColor: themeColor.card }}
            >
              <Column
                verticalArrangement={{ spacedBy: 10 }}
                modifiers={[paddingAll(5)]}
              >
                <Text
                  color={themeColor.text}
                  style={{ typography: "titleSmall", fontWeight: "700" }}
                  modifiers={[paddingAll(8)]}
                >
                  Daily Quests ({quests?.quests.length}) -{" "}
                  {DateTime.fromISO(quests!.last_updated).toFormat(
                    "dd LLL yyyy",
                  )}
                </Text>
                {quests?.quests.map((item, i, arr) => (
                  <QuestCard
                    key={`${item.title}-${item.date}`}
                    quest={item}
                    collapsible
                    isLast={i >= arr.length - 1}
                  />
                ))}
              </Column>
            </Card>
          ) : (
            <Text
              style={{ typography: "bodyMedium" }}
              modifiers={[paddingAll(8)]}
            >
              No quests available right now.
            </Text>
          )}
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
