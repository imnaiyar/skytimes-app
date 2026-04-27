import { QuestCard } from "@/components/quests/QuestCard";
import { Text, View } from "@/components/Themed";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

export default function Candles() {
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  if (loading && !quests) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchQuests({ refresh: true })}
            tintColor={themeColor.tint}
            colors={[themeColor.tint]}
            progressBackgroundColor={themeColor.card}
          />
        }
      >
        {error ? (
          <Text style={[styles.errorText, { color: themeColor.danger }]}>
            {error.message}
          </Text>
        ) : null}

        {quests?.rotating_candles ? (
          <QuestCard quest={quests.rotating_candles} title="Rotating Candles" />
        ) : null}

        {quests?.seasonal_candles ? (
          <QuestCard quest={quests.seasonal_candles} title="Seasonal Candles" />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 5,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 8,
  },
});
