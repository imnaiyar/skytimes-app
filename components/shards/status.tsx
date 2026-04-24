import { useThemeColor } from "@/constants/Colors";
import { formatTime } from "@/utils/event";
import { useNow } from "@/utils/hooks";
import { Row, Text } from "@expo/ui/jetpack-compose";
import { ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

export default function ShardStatus({ date }: { date: DateTime }) {
  const status = ShardsUtil.getStatus(date);
  const themeColor = useThemeColor();

  const now = useNow();

  if (status === "No Shard") return null;
  if (status.every((e) => e.ended))
    return (
      <Text color={themeColor.text} style={{ typography: "titleLarge" }}>
        All shards ended
      </Text>
    );

  const relativeShard = status.find(
    (s) => now <= s.start.toMillis() || now <= s.end.toMillis(),
  );
  if (!relativeShard) return null;
  const time = (
    relativeShard.active ? relativeShard.end : relativeShard.start
  ).toLocal();
  const label = `${relativeShard.index}${ShardsUtil.getSuffix(relativeShard.index)} shard ${relativeShard.active ? "ends" : "lands"} in:`;
  return (
    <>
      <Text color={themeColor.text} style={{ typography: "headlineSmall" }}>
        {label}
      </Text>
      <Row horizontalArrangement={{ spacedBy: 5 }} verticalAlignment="center">
        <Text color={themeColor.tint} style={{ typography: "headlineLarge" }}>
          {formatTime(time.toMillis() - now)}
        </Text>
        <Text color={themeColor.mutedText} style={{ typography: "labelSmall" }}>
          (at {time.toFormat("hh:mm:ss a")})
        </Text>
      </Row>
    </>
  );
}
