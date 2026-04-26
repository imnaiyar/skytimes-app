import { useThemeColor } from "@/constants/Colors";
import { DailyQuest, getMediaType, isTodaysDate } from "@/utils/quests";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Collapsible } from "react-native-fast-collapsible";
import { VideoRef } from "react-native-video";
import { Text } from "../Themed";
import { AnimatedChevron } from "../ui/AnimatedChevron";
import ImageView from "../ui/ImageView";
import QuestVideo from "../ui/VideoPlayer";
import QuestSource from "./source";

interface QuestCardProps {
  quest: DailyQuest;
  isLast?: boolean;
  collapsible?: boolean;
  title?: string;
  setVideoModal?: (url: string | null) => void;
}

export function QuestCard({
  quest,
  isLast = false,
  collapsible = false,
  title,
}: QuestCardProps) {
  const themeColor = useThemeColor();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const image = quest.images?.[0];

  const isValid = isTodaysDate(quest.date);

  const isVideo = getMediaType(image?.url ?? "") === "video";

  const videoRef = useRef<VideoRef>(null);

  const displayTitle = title || quest.title;

  const styles = createStyles(themeColor);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
    if (isCollapsed === false) videoRef.current?.pause();
  };

  if (!isValid) {
    return (
      <Text style={[styles.invalidText, { color: themeColor.mutedText }]}>
        This quest seems to be outdated or invalid!
      </Text>
    );
  }

  const cardContent = (
    <View style={styles.content}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: themeColor.text }]}>
          {title}
        </Text>
      ) : null}

      {(image?.by || image?.source) && (
        <QuestSource source={image.source} credit={image.by} />
      )}

      {quest.description ? (
        <Text style={[styles.description, { color: themeColor.mutedText }]}>
          {quest.description}
        </Text>
      ) : null}

      {image?.url ? (
        isVideo ? (
          <QuestVideo ref={videoRef} uri={image.url} />
        ) : (
          <ImageView url={image.url} />
        )
      ) : null}
    </View>
  );

  if (collapsible) {
    return (
      <View style={[styles.collapsibleWrapper]}>
        <Pressable
          onPress={toggleCollapsed}
          style={({ pressed, hovered }) => [
            styles.collapsibleHeader,
            (pressed || hovered) && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              styles.headerTitle,
              { color: themeColor.text },
            ]}
          >
            {displayTitle}
          </Text>
          <AnimatedChevron isCollapsed={isCollapsed} color={themeColor.text} />
        </Pressable>

        <Collapsible duration={200} isVisible={!isCollapsed}>
          {cardContent}
        </Collapsible>
        {!isLast ? (
          <View
            style={[styles.divider, { backgroundColor: themeColor.border }]}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColor.card,
          borderColor: themeColor.border,
        },
      ]}
    >
      {cardContent}
    </View>
  );
}

const createStyles = (themeColor: ReturnType<typeof useThemeColor>) =>
  StyleSheet.create({
    invalidText: {
      fontSize: 12,
      lineHeight: 18,
      padding: 8,
    },
    card: {
      width: "100%",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },
    content: {
      gap: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 22,
    },

    description: {
      fontSize: 12,
      lineHeight: 18,
    },
    collapsibleWrapper: {
      width: "100%",
      gap: 4,
      backgroundColor: themeColor.card,
    },
    collapsibleHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    headerTitle: {
      flex: 1,
      paddingRight: 8,
    },
    collapsibleBody: {
      paddingTop: 0,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      width: "100%",
    },
    pressed: {
      backgroundColor: themeColor.overlay,
    },
  });
