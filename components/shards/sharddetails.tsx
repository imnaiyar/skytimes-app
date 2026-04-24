import { useThemeColor } from "@/constants/Colors";
import { useNow } from "@/utils/hooks";
import {
  Column,
  FlowRow,
  Icon,
  IconButton,
  Row,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
  TooltipBox,
} from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  animated,
  border,
  clickable,
  fillMaxWidth,
  graphicsLayer,
  height,
  tween,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { shardsTimeline, ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { useState } from "react";

export function ShardDetails({ date }: { date: DateTime }) {
  const [selected, setTab] = useState(1);
  const [visible, setVisible] = useState(false);
  const { currentShard } = ShardsUtil.shardsIndex(date);
  const details = shardsTimeline(date)[currentShard];
  const now = useNow();

  const themeColor = useThemeColor();

  const calculateTimeRender = (instance: DateTime) => {
    const isPast = instance.toMillis() - now < 0;
    return (
      <Text
        color={isPast ? themeColor.mutedText : themeColor.tint}
        style={{
          typography: "bodyMedium",
          textDecoration: isPast ? "lineThrough" : "none",
        }}
      >
        {instance.toLocal().toFormat("hh:mm:ss a")}
      </Text>
    );
  };
  return (
    <Column
      horizontalAlignment="center"
      verticalArrangement={{ spacedBy: 8 }}
      modifiers={[animateContentSize(1, 300)]}
    >
      <Row
        modifiers={[
          fillMaxWidth(),
          clickable(() => setVisible((prev) => !prev)),
        ]}
        verticalAlignment="center"
        horizontalArrangement="spaceBetween"
      >
        <Text
          color={themeColor.text}
          style={{ typography: "titleSmall", fontWeight: "700" }}
          modifiers={[weight(1)]}
        >
          Details
        </Text>
        <Icon
          source={require("@/assets/icons/expand_more_24px.xml")}
          size={20}
          tint={themeColor.mutedText}
          modifiers={[
            graphicsLayer({
              rotationZ: animated(
                !visible ? -90 : 0,
                tween({ durationMillis: 180, easing: "fastOutSlowIn" }),
              ),
            }),
          ]}
        />
      </Row>
      {visible && (
        <Column verticalArrangement={{ spacedBy: 8 }}>
          <SingleChoiceSegmentedButtonRow
            modifiers={[fillMaxWidth(), height(30)]}
          >
            {details.map((detail, index) => (
              <SegmentedButton
                key={index}
                selected={index === selected}
                onClick={() => setTab(index)}
              >
                <SegmentedButton.Label>
                  <Text color={themeColor.text}>
                    {index + 1 + ShardsUtil.getSuffix(index + 1)} shard
                  </Text>
                </SegmentedButton.Label>
              </SegmentedButton>
            ))}
          </SingleChoiceSegmentedButtonRow>
          <FlowRow
            horizontalArrangement={"spaceEvenly"}
            verticalArrangement={{ spacedBy: 30 }}
            modifiers={[fillMaxWidth()]}
          >
            {[
              details[selected].earlySky,
              details[selected].gateShard,
              details[selected].start,
              details[selected].end,
              details[selected].shardMusic,
            ].map((time, i) => (
              <Column
                key={i}
                horizontalAlignment="start"
                verticalArrangement={{ spacedBy: 5 }}
              >
                <Row verticalAlignment="center" horizontalArrangement={"start"}>
                  <Text
                    color={themeColor.text}
                    style={{ typography: "titleSmall" }}
                  >
                    {labels[i][0]}
                  </Text>
                  <TooltipBox focusable>
                    <TooltipBox.PlainTooltip
                      containerColor={themeColor.card}
                      contentColor={themeColor.text}
                      modifiers={[border(1, themeColor.border)]}
                    >
                      <Text>{labels[i][1]}</Text>
                    </TooltipBox.PlainTooltip>
                    <IconButton>
                      <Icon
                        tint={themeColor.tint}
                        source={require("@/assets/icons/info.xml")}
                        size={15}
                      />
                    </IconButton>
                  </TooltipBox>
                </Row>
                {typeof time === "string" ? (
                  <Text
                    color={themeColor.tint}
                    style={{ typography: "bodySmall" }}
                  >
                    {time}
                  </Text>
                ) : (
                  calculateTimeRender(time)
                )}
              </Column>
            ))}
          </FlowRow>
        </Column>
      )}
    </Column>
  );
}

const labels = [
  [
    "Early Sky Change",
    "The time at which sky color changes in all the realms.",
  ],
  [
    "Gate Shard",
    "The time at which shard crystal appears on the realm door of the realm where shard is to fall.",
  ],
  ["Shard Land", "The time when the shard lands"],
  ["Shard End", "The time when the shard ends"],
  ["Shard Music", "The music that will play during this shard"],
];
