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
import { Pressable, View } from "react-native";
import EnhancedImageViewing from "react-native-image-viewing";

export default function ShardLocationImage({
  info,
  date,
}: {
  info: ShardInfo;
  date: DateTime;
}) {
  const [selectedTab, setTab] = useState<"Location" | "Data">("Location");
  const [imageView, setImageView] = useState(false);

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
        <View style={{ width: "100%", padding: 10 }}>
          <Pressable onPress={() => setImageView(true)}>
            <Image
              source={url}
              loading="lazy"
              style={{
                width: "100%",
                height: 300,
                borderRadius: 10,
              }}
              contentFit="contain"
            />
          </Pressable>
          <EnhancedImageViewing
            images={[{ uri: url }]}
            imageIndex={0}
            visible={imageView}
            onRequestClose={() => setImageView(false)}
          />
        </View>
      </RNHostView>
    </Column>
  );
}

const mappings = {
  location: {
    A: {
      prairie: require("@/assets/images/shards/location/A/prairie.png"),
      forest: require("@/assets/images/shards/location/A/forest.png"),
      valley: require("@/assets/images/shards/location/A/valley.png"),
      wasteland: require("@/assets/images/shards/location/A/wasteland.png"),
      vault: require("@/assets/images/shards/location/A/vault.png"),
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
      prairie: require("@/assets/images/shards/location/B/prairie.jpeg"),
      forest: require("@/assets/images/shards/location/B/forest.png"),
      valley: require("@/assets/images/shards/location/B/valley.png"),
      wasteland: require("@/assets/images/shards/location/B/wasteland.png"),
      vault: require("@/assets/images/shards/location/A/vault.png"),
    },
    C: {
      prairie: require("@/assets/images/shards/location/C/prairie.png"),
      forest: require("@/assets/images/shards/location/C/forest.png"),
      valley: require("@/assets/images/shards/location/C/valley.png"),
      wasteland: require("@/assets/images/shards/location/C/wasteland.png"),
      vault: require("@/assets/images/shards/location/A/vault.png"),
    },
  },
  data: {
    A: {
      prairie: require("@/assets/images/shards/data/A/prairie.png"),
      forest: require("@/assets/images/shards/data/A/forest.png"),
      valley: require("@/assets/images/shards/data/A/valley.png"),
      wasteland: require("@/assets/images/shards/data/A/wasteland.png"),
      vault: require("@/assets/images/shards/data/A/vault.png"),
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
      prairie: require("@/assets/images/shards/data/B/prairie.png"),
      forest: require("@/assets/images/shards/data/B/forest.png"),
      valley: require("@/assets/images/shards/data/B/valley.png"),
      wasteland: require("@/assets/images/shards/data/B/wasteland.png"),
      vault: require("@/assets/images/shards/data/A/vault.png"),
    },
    C: {
      prairie: require("@/assets/images/shards/data/C/prairie.jpg"),
      forest: require("@/assets/images/shards/data/C/forest.png"),
      valley: require("@/assets/images/shards/data/C/valley.png"),
      wasteland: require("@/assets/images/shards/data/C/wasteland.png"),
      vault: require("@/assets/images/shards/data/A/vault.png"),
    },
  },
};
