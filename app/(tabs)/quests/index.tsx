import { QuestCard } from "@/components/QuestCard";
import { Text } from "@/components/Themed";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useDailyQuestsStore } from "@/utils/quests";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function Quests() {
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();
  const themeColor = Colors[useColorScheme() ?? "dark"];

  useEffect(() => {
    // fetch quests at least once
    fetchQuests();
  }, [fetchQuests]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={{ color: themeColor.danger }}>/{error.message}</Text>
      ) : loading ? (
        <LoadingScreen style={{ backgroundColor: "transparent" }} />
      ) : (
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
              backgroundColor: themeColor.card,
              borderWidth: 1,
              borderColor: themeColor.border,
              borderRadius: 15,
              padding: 5,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                padding: 8,
                position: "fixed",
                marginBottom: 10,
              }}
            >
              Daily Quests ({quests?.quests.length}) -{" "}
              {DateTime.fromISO(quests!.last_updated).toFormat("dd LLL yyyy")}
            </Text>
            {quests?.quests.map((item, i, arr) => (
              <QuestCard
                key={i}
                quest={item}
                collapsible
                isLast={i >= arr.length - 1}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
});
