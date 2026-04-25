import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DailyQuest, getMediaType, isTodaysDate } from "@/utils/quests";
import {
  Card,
  Column,
  HorizontalDivider,
  Icon,
  RNHostView,
  Row,
  Spacer,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  animated,
  clickable,
  fillMaxWidth,
  graphicsLayer,
  padding,
  paddingAll,
  tween,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Linking } from "react-native";
import ImageView from "../ui/ImageView";
import QuestVideo from "./QuestVideo";

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
  const themeColor = Colors[useColorScheme()];
  const [isCollapsed, setIsCollapsed] = useState(true);

  const image = quest.images?.[0];
  const credit = image?.by;
  const source = image?.source;

  const isValid = isTodaysDate(quest.date);
  const isVideo = getMediaType(image?.url ?? "") === "video";
  const displayTitle = title || quest.title;

  if (!isValid) {
    return (
      <Text
        color={themeColor.mutedText}
        style={{ typography: "bodySmall" }}
        modifiers={[paddingAll(8)]}
      >
        This quest seems to be outdated or invalid!
      </Text>
    );
  }

  const cardContent = (
    <Column verticalArrangement={{ spacedBy: 10 }} modifiers={[paddingAll(10)]}>
      {title && (
        <Text
          style={{ typography: "titleSmall", fontWeight: "700" }}
          color={themeColor.text}
        >
          {title}
        </Text>
      )}

      {(credit || source) && (
        <Row
          verticalAlignment="center"
          horizontalArrangement="center"
          modifiers={[fillMaxWidth()]}
        >
          {credit && (
            <Text
              color={themeColor.mutedText}
              style={{ typography: "labelSmall" }}
            >
              {credit}
            </Text>
          )}
          <Spacer modifiers={[width(8)]} />
          {credit && source && (
            <Text
              color={themeColor.mutedText}
              style={{ typography: "labelSmall" }}
            >
              •
            </Text>
          )}

          <Spacer modifiers={[width(8)]} />
          {source && (
            <Text
              color={themeColor.link}
              style={{ typography: "labelSmall", textDecoration: "underline" }}
              modifiers={[
                clickable(() => {
                  Linking.openURL(source).catch(() => undefined);
                }),
              ]}
            >
              Source
            </Text>
          )}
        </Row>
      )}

      {quest.description && (
        <Text color={themeColor.mutedText} style={{ typography: "bodySmall" }}>
          {quest.description}
        </Text>
      )}

      {image?.url ? (
        isVideo ? (
          <QuestVideo uri={image.url} />
        ) : (
          <RNHostView matchContents>
            <ImageView url={image.url} />
          </RNHostView>
        )
      ) : null}
    </Column>
  );

  if (collapsible) {
    return (
      <Column
        verticalArrangement={{ spacedBy: 4 }}
        modifiers={[fillMaxWidth(), animateContentSize(1, 300)]}
      >
        <Card
          modifiers={[
            fillMaxWidth(),
            padding(4, 2, 4, 2),
            clickable(() => setIsCollapsed((prev) => !prev)),
          ]}
          colors={{ containerColor: themeColor.overlay }}
        >
          <Row
            modifiers={[fillMaxWidth(), paddingAll(8)]}
            verticalAlignment="center"
            horizontalArrangement="spaceBetween"
          >
            <Text
              color={themeColor.text}
              style={{ typography: "titleSmall", fontWeight: "700" }}
              modifiers={[weight(1)]}
            >
              {displayTitle}
            </Text>
            <Icon
              source={require("@/assets/icons/expand_more_24px.xml")}
              size={20}
              tint={themeColor.mutedText}
              modifiers={[
                graphicsLayer({
                  rotationZ: animated(
                    isCollapsed ? -90 : 0,
                    tween({ durationMillis: 180, easing: "fastOutSlowIn" }),
                  ),
                }),
              ]}
            />
          </Row>
        </Card>

        {!isCollapsed && (
          <Column modifiers={[padding(8, 0, 8, 8)]}>{cardContent}</Column>
        )}

        {!isLast && <HorizontalDivider color={themeColor.border} />}
      </Column>
    );
  }

  return (
    <Card
      modifiers={[fillMaxWidth(), paddingAll(12)]}
      border={{ color: themeColor.border, width: 1 }}
      colors={{ containerColor: themeColor.card }}
    >
      {cardContent}
    </Card>
  );
}
