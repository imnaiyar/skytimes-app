import { QuestCard } from "@/components/QuestCard";
import { Text } from "@/components/Themed";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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
    <View style={styles.container}>
      <ScrollView
        style={{
          flex: 1,
          margin: 5,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            gap: 10,
          }}
        >
          {rotating_candles && (
            <QuestCard quest={rotating_candles} title="Rotating Candles" />
          )}
          {seasonal_candles && (
            <QuestCard quest={seasonal_candles} title="Seasonal Candles" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
});
