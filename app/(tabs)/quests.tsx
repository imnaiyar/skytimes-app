import { LoadingScreen } from "@/components/LoadingScreen";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DailyQuest, isTodaysDate, useDailyQuests } from "@/utils/quests";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";

export default function Quests() {
  const { quests, loading, error, refresh } = useDailyQuests();
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const { height } = useWindowDimensions();
  console.log(process.env.EXPO_SKYHELPER_API_URL);
  return (
    <ScrollView style={{ flex: 1, minHeight: "80%" }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColor.card,
            borderColor: themeColor.border,
            minHeight: height * 0.6,
          },
        ]}
      >
        {loading ? (
          <LoadingScreen style={{ backgroundColor: "transparent" }} />
        ) : (
          <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 20,
                padding: 8,
                borderColor: themeColor.border,
                borderBottomWidth: 1,
                marginBottom: 10,
              }}
            >
              Hello
            </Text>
            {quests?.quests.map(renderQuest)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    margin: 20,
  },
});

function renderQuest(quest: DailyQuest) {
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const image = quest.images?.[0];
  const credit = image?.by;
  const source = image?.source;

  const isValid = isTodaysDate(quest.date);

  if (!isValid)
    return <Text>This quest seems to be outdated or invalid!.</Text>;

  return (
    <View
      style={{
        flex: 1,
        gap: 4,
        flexDirection: "row",
        paddingLeft: 10,
        backgroundColor: "transparent",
      }}
    >
      <Text style={{ fontSize: 14, marginRight: 8 }}>•</Text>
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 14,
            color: image?.url ? "rgba(22, 61, 186, 1)" : themeColor.text,
          }}
        >
          {quest.title}
        </Text>
        {quest.description && (
          <Text style={{ fontSize: 8, color: themeColor.mutedText }}>
            {quest.description}
          </Text>
        )}
      </View>
    </View>
  );
}
