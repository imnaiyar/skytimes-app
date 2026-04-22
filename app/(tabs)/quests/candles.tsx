import { QuestCard } from "@/components/QuestCard";
import { Text } from "@/components/Themed";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { Host, LazyColumn, PullToRefreshBox } from "@expo/ui/jetpack-compose";
import { fillMaxHeight, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function Candles() {
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();

  useEffect(() => {
    // fetch quests at least once
    fetchQuests();
  }, [fetchQuests]);

  if (loading) return <LoadingScreen />;
  if (error)
    return <Text style={{ color: themeColor.danger }}>{error.message}</Text>;
  const { rotating_candles, seasonal_candles } = quests!;
  return (
    <Host style={{ flex: 1 }}>
      <PullToRefreshBox
        contentAlignment="topCenter"
        indicator={{
          color: themeColor.card,
          containerColor: themeColor.tint,
        }}
        isRefreshing={loading}
        onRefresh={fetchQuests}
      >
        <LazyColumn modifiers={[fillMaxHeight(), padding(5, 5, 5, 5)]}>
          {rotating_candles && (
            <QuestCard quest={rotating_candles} title="Rotating Candles" />
          )}
          {seasonal_candles && (
            <QuestCard quest={seasonal_candles} title="Seasonal Candles" />
          )}
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
});
