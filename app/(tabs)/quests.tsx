import { ExternalLink } from "@/components/ExternalLink";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  DailyQuest,
  getMediaType,
  isTodaysDate,
  useDailyQuestsStore,
} from "@/utils/quests";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import ImageView from "react-native-image-viewing";

export default function Quests() {
  const { quests, loading, error, fetchQuests } = useDailyQuestsStore();
  const themeColor = Colors[useColorScheme() ?? "dark"];

  useEffect(() => {
    // fetch quests at least once
    fetchQuests();
  }, []);

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
            Daily Quests ({quests?.quests.length}) -{" "}
            {DateTime.fromISO(quests!.last_updated).toFormat("dd LLL yyyy")}
          </Text>

          <ScrollView
            style={{ flex: 1, minHeight: "80%" }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, gap: 20 }}>
              {quests?.quests.map((item, i) => (
                <QuestItem key={i} quest={item} />
              ))}
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
    padding: 5,
    margin: 20,
  },
});

function QuestItem({ quest }: { quest: DailyQuest }) {
  const themeColor = Colors[useColorScheme() ?? "dark"];

  const [imageModalVisible, setImageModal] = useState(false);
  const image = quest.images?.[0];
  const credit = image?.by;
  const source = image?.source;
  const player = useVideoPlayer({ useCaching: true, uri: image?.url });

  const isValid = isTodaysDate(quest.date);
  const isVideo = getMediaType(image?.url ?? "") === "video";

  if (!isValid)
    return <Text>This quest seems to be outdated or invalid!.</Text>;

  return (
    <View
      style={{
        width: "100%",
        gap: 4,
        backgroundColor: themeColor.card,
        borderWidth: 1,
        borderColor: themeColor.border,
        borderRadius: 15,
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 10,
            padding: 10,
            fontSize: 20,
            borderBottomColor: themeColor.border,
            borderBottomWidth: 1,
          }}
        >
          {quest.title}
        </Text>

        {(credit || source) && (
          <View
            style={{
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              flexDirection: "row",
            }}
          >
            {credit && (
              <Text style={{ fontSize: 12, color: themeColor.mutedText }}>
                {credit} {"  "}•{" "}
              </Text>
            )}
            {source && (
              <ExternalLink href={source} style={{ gap: 4 }}>
                <View
                  style={{
                    gap: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 12, color: themeColor.link }}>
                    Source
                  </Text>
                  <FontAwesome
                    name="external-link"
                    size={8}
                    color={themeColor.link}
                  />
                </View>
              </ExternalLink>
            )}
          </View>
        )}
        {quest.description && (
          <Text style={{ fontSize: 8, color: themeColor.mutedText }}>
            {quest.description}
          </Text>
        )}

        {image?.url && (
          <View
            style={{
              width: "100%",
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}
          >
            {isVideo ? (
              <VideoView
                player={player}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                }}
                contentFit="contain"
                allowsPictureInPicture
              />
            ) : (
              <>
                {/* TODO: Have dedicate component for this with more customizations */}
                <Pressable onPress={() => setImageModal(true)}>
                  <Image
                    source={image.url}
                    style={{
                      width: "100%",
                      height: 300,
                      borderRadius: 10,
                    }}
                    contentFit="contain"
                  />
                </Pressable>
                <ImageView
                  images={[{ uri: image.url }]}
                  imageIndex={0}
                  visible={imageModalVisible}
                  onRequestClose={() => setImageModal(false)}
                />
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
