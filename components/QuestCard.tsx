import { ExternalLink } from "@/components/ExternalLink";
import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DailyQuest, getMediaType, isTodaysDate } from "@/utils/quests";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Collapsible } from "react-native-fast-collapsible";
import ImageView from "react-native-image-viewing";
import { AnimatedChevron } from "./ui/AnimatedChevron";

interface QuestCardProps {
  quest: DailyQuest;
  isLast?: boolean;
  collapsible?: boolean;
  title?: string;
}

export function QuestCard({
  quest,
  isLast = false,
  collapsible = false,
  title,
}: QuestCardProps) {
  const themeColor = Colors[useColorScheme() ?? "dark"];
  const [imageModalVisible, setImageModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const image = quest.images?.[0];
  const credit = image?.by;
  const source = image?.source;
  const player = useVideoPlayer({ useCaching: true, uri: image?.url });

  const isValid = isTodaysDate(quest.date);
  const isVideo = getMediaType(image?.url ?? "") === "video";
  const displayTitle = title || quest.title;

  if (!isValid) return <Text>This quest seems to be outdated or invalid!</Text>;

  const cardContent = (
    <View style={{ gap: 10 }}>
      {title && (
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {title}
        </Text>
      )}

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
        <Text style={{ fontSize: 12, color: themeColor.mutedText }}>
          {quest.description}
        </Text>
      )}

      {image?.url && (
        <View
          style={{
            width: "100%",
            paddingVertical: 10,
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
  );

  if (collapsible) {
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
            style={(state) => ({
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor:
                state.pressed || state.hovered
                  ? themeColor.overlay
                  : "transparent",
              alignItems: "center",
              borderRadius: 12,
              marginBottom: 5,
              padding: 8,
            })}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 13,
                flex: 1,
              }}
            >
              {displayTitle}
            </Text>
            <AnimatedChevron
              isCollapsed={isCollapsed}
              color={themeColor.text}
              size={16}
            />
          </Pressable>

          <Collapsible isVisible={!isCollapsed}>{cardContent}</Collapsible>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: themeColor.card,
        borderWidth: 1,
        borderColor: themeColor.border,
        borderRadius: 15,
        padding: 12,
      }}
    >
      {cardContent}
    </View>
  );
}
