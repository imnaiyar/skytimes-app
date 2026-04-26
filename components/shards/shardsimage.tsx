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
import { DateTime } from "luxon";
import { useState } from "react";
import ImageView from "../ui/ImageView";

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
  const url =
    mappings[selectedTab.toLowerCase() as "data" | "location"][currentShard][
      currentRealm
    ];
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

const mappings = {
  location: {
    A: {
      prairie: require("@/assets/images/shards/location/A/prairiea.png"),
      forest: require("@/assets/images/shards/location/A/foresta.png"),
      valley: require("@/assets/images/shards/location/A/valleya.png"),
      wasteland: require("@/assets/images/shards/location/A/wastelanda.png"),
      vault: require("@/assets/images/shards/location/A/vaulta.png"),
    },
    a: {
      prairie: require("@/assets/images/shards/location/a/prairie.png"),
      forest: require("@/assets/images/shards/location/a/forest.png"),
      valley: require("@/assets/images/shards/location/a/valley.png"),
      wasteland: require("@/assets/images/shards/location/a/wasteland.png"),
      vault: require("@/assets/images/shards/location/a/vault.png"),
    },
    b: {
      prairie: require("@/assets/images/shards/location/b/prairie.png"),
      forest: require("@/assets/images/shards/location/b/forest.png"),
      valley: require("@/assets/images/shards/location/b/valley.png"),
      wasteland: require("@/assets/images/shards/location/b/wasteland.png"),
      vault: require("@/assets/images/shards/location/a/vault.png"),
    },
    B: {
      prairie: require("@/assets/images/shards/location/B/prairieb.jpeg"),
      forest: require("@/assets/images/shards/location/B/forestb.png"),
      valley: require("@/assets/images/shards/location/B/valleyb.png"),
      wasteland: require("@/assets/images/shards/location/B/wastelandb.png"),
      vault: require("@/assets/images/shards/location/A/vaulta.png"),
    },
    C: {
      prairie: require("@/assets/images/shards/location/C/prairie.png"),
      forest: require("@/assets/images/shards/location/C/forest.png"),
      valley: require("@/assets/images/shards/location/C/valley.png"),
      wasteland: require("@/assets/images/shards/location/C/wasteland.png"),
      vault: require("@/assets/images/shards/location/A/vaulta.png"),
    },
  },
  data: {
    A: {
      prairie: require("@/assets/images/shards/data/A/prairiea.png"),
      forest: require("@/assets/images/shards/data/A/foresta.png"),
      valley: require("@/assets/images/shards/data/A/valleya.png"),
      wasteland: require("@/assets/images/shards/data/A/wastelanda.png"),
      vault: require("@/assets/images/shards/data/A/vaulta.png"),
    },
    a: {
      prairie: require("@/assets/images/shards/data/a/prairie.png"),
      forest: require("@/assets/images/shards/data/a/forest.png"),
      valley: require("@/assets/images/shards/data/a/valley.png"),
      wasteland: require("@/assets/images/shards/data/a/wasteland.png"),
      vault: require("@/assets/images/shards/data/a/vault.png"),
    },
    b: {
      prairie: require("@/assets/images/shards/data/b/prairie.png"),
      forest: require("@/assets/images/shards/data/b/forest.png"),
      valley: require("@/assets/images/shards/data/b/valley.png"),
      wasteland: require("@/assets/images/shards/data/b/wasteland.png"),
      vault: require("@/assets/images/shards/data/a/vault.png"),
    },
    B: {
      prairie: require("@/assets/images/shards/data/B/prairieb.png"),
      forest: require("@/assets/images/shards/data/B/forestb.png"),
      valley: require("@/assets/images/shards/data/B/valleyb.png"),
      wasteland: require("@/assets/images/shards/data/B/wastelandb.png"),
      vault: require("@/assets/images/shards/data/A/vaulta.png"),
    },
    C: {
      prairie: require("@/assets/images/shards/data/C/prairie.jpg"),
      forest: require("@/assets/images/shards/data/C/forest.png"),
      valley: require("@/assets/images/shards/data/C/valley.png"),
      wasteland: require("@/assets/images/shards/data/C/wasteland.png"),
      vault: require("@/assets/images/shards/data/A/vaulta.png"),
    },
  },
};
