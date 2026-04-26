import { QuestCard } from "@/components/quests/QuestCard";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { DateTime } from "luxon";
import { useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function Quests() {
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();
  const themeColor = Colors[useColorScheme() ?? "dark"];

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const hasQuests = Boolean(quests?.quests?.length);

  return (
    <View style={[styles.screen]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchQuests}
            tintColor={themeColor.tint}
            colors={[themeColor.tint]}
            progressBackgroundColor={themeColor.card}
          />
        }
      >
        {error ? (
          <Text style={[styles.message, { color: themeColor.danger }]}>
            {error.message}
          </Text>
        ) : loading && !quests ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={themeColor.tint} />
          </View>
        ) : hasQuests ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColor.card,
                borderColor: themeColor.border,
              },
            ]}
          >
            <View style={[styles.cardBody, { backgroundColor: "transparent" }]}>
              <Text style={[styles.header, { color: themeColor.text }]}>
                Daily Quests ({quests?.quests.length}) -{" "}
                {DateTime.fromISO(quests!.last_updated).toFormat("dd LLL yyyy")}
              </Text>
              {quests?.quests.map((item, i, arr) => (
                <QuestCard
                  key={`${item.title}-${item.date}`}
                  quest={item}
                  collapsible
                  isLast={i >= arr.length - 1}
                />
              ))}
            </View>
          </View>
        ) : (
          <Text style={[styles.message, { color: themeColor.text }]}>
            No quests available right now.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 5,
  },
  loadingState: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
  },
  cardBody: {
    gap: 10,
    padding: 5,
  },
  header: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 22,
    padding: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    padding: 8,
  },
});
