import { useThemeColor } from "@/constants/Colors";
import {
  Column,
  HorizontalDivider,
  RNHostView,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, height } from "@expo/ui/jetpack-compose/modifiers";
import { ShardInfo, ShardsUtil } from "@skyhelperbot/utils";
import { Image } from "expo-image";
import { DateTime } from "luxon";
import { useState } from "react";
import ImageView from "../ui/ImageView";

// Vault only has two shard variants, that is reused between different variants
// For that reasons, there's only two image hosted and i have not opted to duplicate the image for the sake of it
// So we need to map it correctly to point to right image
const CommonVaultRedVariants = ["B", "C", "A"];

export default function ShardLocationImage({
  info,
  date,
}: {
  info: ShardInfo;
  date: DateTime;
}) {
  const [selectedTab, setTab] = useState<"Location" | "Data">("Location");

  const themeColor = useThemeColor();

  const { currentRealm, currentShard } = ShardsUtil.shardsIndex(date);

  const variant =
    currentRealm === "vault"
      ? CommonVaultRedVariants.includes(currentShard)
        ? "A"
        : "a"
      : currentShard;

  // prefecth so image transition feels seemless
  Image.prefetch([
    process.env.EXPO_PUBLIC_SKYHELPER_CDN +
      `/shards/data/${variant}/${currentRealm}.png`,
    process.env.EXPO_PUBLIC_SKYHELPER_CDN +
      `/shards/Location/${variant}/${currentRealm}.png`,
  ]);

  const url =
    process.env.EXPO_PUBLIC_SKYHELPER_CDN +
    `/shards/${selectedTab.toLowerCase()}/${variant}/${currentRealm}.png`;

  return (
    <Column verticalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth()]}>
      <HorizontalDivider />
      <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth(), height(30)]}>
        {(["Location", "Data"] as const).map((label) => (
          <SegmentedButton
            key={label}
            selected={selectedTab === label}
            onClick={() => setTab(label)}
            colors={{ activeContainerColor: themeColor.border }}
          >
            <SegmentedButton.Label>
              <Text color={themeColor.text}>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
      <RNHostView matchContents>
        <ImageView url={url} />
      </RNHostView>
    </Column>
  );
}
