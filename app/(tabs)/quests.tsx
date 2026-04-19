import { LoadingScreen } from "@/components/LoadingScreen";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  DailyQuest,
  getMediaType,
  isTodaysDate,
  useDailyQuests,
} from "@/utils/quests";
import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function Quests() {
  const { quests, loading, error, refresh } = useDailyQuests();
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const { height } = useWindowDimensions();
  return (
    <View style={styles.container}>
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

          <ScrollView style={{ flex: 1, minHeight: "80%" }}>
            <View style={{ flex: 1, gap: 20 }}>
              {quests?.quests.map(renderQuest)}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    margin: 20,
  },
});

function renderQuest(quest: DailyQuest, index = 0) {
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const image = quest.images?.[0];
  const credit = image?.by;
  const source = image?.source;

  const isValid = isTodaysDate(quest.date);
  const isVideo = getMediaType(image?.url ?? "") === "video";
  if (!isValid)
    return <Text>This quest seems to be outdated or invalid!.</Text>;

  return (
    <View
      key={index}
      style={{
        flex: 1,
        gap: 4,
        flexDirection: "row",
        paddingLeft: 10,
        backgroundColor: themeColor.card,
        borderWidth: 1,
        borderColor: themeColor.border,
        borderRadius: 15,
        overflow: "hidden",
      }}
    >
      <View style={{ backgroundColor: "transparent" }}>
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 30,
            borderBottomColor: themeColor.border,
            borderBottomWidth: 1,
            width: "auto",
          }}
        >
          {quest.title}
        </Text>
        {quest.description && (
          <Text style={{ fontSize: 8, color: themeColor.mutedText }}>
            {quest.description}
          </Text>
        )}
        {image?.url && (
          <View style={{ alignContent: "center", alignItems: "center" }}>
            {isVideo ? (
              "Video Not Supported Yet"
            ) : (
              <Image height={40} width={40} source={{ uri: image.url }} />
            )}
          </View>
        )}
      </View>
    </View>
  );
}
