import { useThemeColor } from "@/constants/Colors";
import { SKY_ZONE } from "@/constants/common";
import {
  AssistChip,
  Card,
  Column,
  HorizontalDivider,
  Host,
  Icon,
  LazyColumn,
  Row,
  Spacer,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  paddingAll,
} from "@expo/ui/jetpack-compose/modifiers";
import { ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { useState } from "react";
import { DateDialog } from "../ui/DateTimePicker";
import { Header } from "../ui/Header";
import { ShardDetails } from "./sharddetails";
import ShardLocationImage from "./shardsimage";
import ShardStatus from "./status";

// Original shard info has discord emoji hardcoded in info (i made it like when i was learning tbf), im lazy to remove it their, so doing it here
const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;

export default function Screen() {
  const themeColor = useThemeColor();
  const [date, setDate] = useState(DateTime.now().setZone(SKY_ZONE));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const shards = ShardsUtil.getShard(date);

  const RewardIcon = (
    <Row verticalAlignment="center">
      <Text color={themeColor.text} style={{ typography: "titleMedium" }}>
        {shards?.ac || shards?.wax}
      </Text>

      <Icon
        source={
          shards?.ac
            ? require("@/assets/icons/ac.svg")
            : require("@/assets/icons/wax.png")
        }
        size={20}
      />
    </Row>
  );
  return (
    <>
      <Header title="Shards" leftIcon={require("@/assets/images/shards.png")} />
      <Host style={{ flex: 1, backgroundColor: themeColor.background }}>
        {showDatePicker && (
          <DateDialog
            onDismissRequest={() => setShowDatePicker(false)}
            initialDate={date.toISODate()}
            onDateSelected={(pickedDate) => {
              const pickedInSkyZone = DateTime.fromObject(
                {
                  year: pickedDate.getFullYear(),
                  month: pickedDate.getMonth() + 1,
                  day: pickedDate.getDate(),
                },
                { zone: SKY_ZONE },
              );

              setDate(pickedInSkyZone);
              setShowDatePicker(false);
            }}
          />
        )}
        <LazyColumn>
          <Card
            colors={{ containerColor: themeColor.card }}
            border={{ width: 1, color: themeColor.border }}
            modifiers={[fillMaxWidth(), paddingAll(10)]}
          >
            <Column
              verticalArrangement={{ spacedBy: 10 }}
              modifiers={[paddingAll(10)]}
            >
              <Row
                horizontalArrangement={"spaceBetween"}
                verticalAlignment="center"
                modifiers={[fillMaxWidth()]}
              >
                {/** Title Header */}
                <Row
                  verticalAlignment="center"
                  horizontalArrangement={{ spacedBy: 5 }}
                >
                  <Text
                    color={themeColor.text}
                    style={{ typography: "titleLarge" }}
                  >
                    Shards
                  </Text>

                  {(shards?.ac || shards?.wax) && (
                    <>
                      <Text>(</Text>
                      {RewardIcon}
                      <Text>)</Text>
                    </>
                  )}
                </Row>

                {/** DatePicker Chip */}
                <AssistChip onClick={() => setShowDatePicker(true)}>
                  <AssistChip.Label>
                    <Text color={themeColor.text}>
                      {date.hasSame(DateTime.now().setZone(SKY_ZONE), "day")
                        ? "Today"
                        : date.toFormat("dd-MM-yyyy")}
                    </Text>
                  </AssistChip.Label>
                  <AssistChip.LeadingIcon>
                    <Icon
                      source={require("@/assets/icons/calendar_24px.xml")}
                      tint={themeColor.tint}
                      size={18}
                    />
                  </AssistChip.LeadingIcon>
                </AssistChip>
              </Row>
              <HorizontalDivider />

              <Column
                horizontalAlignment="center"
                verticalArrangement={{ spacedBy: 15 }}
              >
                {!shards ? (
                  <Text color={themeColor.text}>No Shards</Text>
                ) : (
                  <Column
                    verticalArrangement={{ spacedBy: 8 }}
                    horizontalAlignment="center"
                  >
                    <Text
                      color={themeColor.text}
                      style={{ typography: "titleMedium" }}
                    >
                      <Text
                        color={shards.type === "black" ? "#000000" : `#8C1D18`}
                        style={{
                          shadow: { offsetY: 3 },
                          textDecoration: "underline",
                          fontWeight: "bold",
                        }}
                      >
                        {shards.type === "black" ? "Black" : "Red"} Shard
                      </Text>
                      <Text> at</Text>
                      <Text> {shards.area.replace(emojiRegex, "")}</Text>
                    </Text>

                    <Spacer modifiers={[height(10)]} />
                    <ShardStatus date={date} />
                    <Spacer modifiers={[height(30)]} />

                    <ShardDetails date={date} />
                    <ShardLocationImage date={date} info={shards} />
                  </Column>
                )}
              </Column>
            </Column>
          </Card>
        </LazyColumn>
      </Host>
    </>
  );
}
