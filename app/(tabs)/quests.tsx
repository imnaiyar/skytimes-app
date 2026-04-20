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
import Collapsible from "react-native-collapsible";
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
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
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
              {quests?.quests.map((item, i, arr) => (
                <QuestItem key={i} quest={item} isLast={i >= arr.length - 1} />
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
  },
});

function QuestItem({ quest, isLast }: { quest: DailyQuest; isLast: boolean }) {
  const themeColor = Colors[useColorScheme() ?? "dark"];

  const [imageModalVisible, setImageModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
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
        overflow: "hidden",
        borderBottomColor: themeColor.border,
        borderBottomWidth: isLast ? 0 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 13,
              flex: 1,
            }}
          >
            {quest.title}
          </Text>
          <FontAwesome
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={16}
            color={themeColor.text}
          />
        </Pressable>

        <Collapsible collapsed={isCollapsed}>
          {(credit || source) && (
            <View
              style={{
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                flexDirection: "row",
                marginTop: 10,
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
        </Collapsible>
      </View>
    </View>
  );
}
