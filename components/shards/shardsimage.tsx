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
import { ShardInfo } from "@skyhelperbot/utils";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import EnhancedImageViewing from "react-native-image-viewing";

export default function ShardLocationImage({ info }: { info: ShardInfo }) {
  const [selectedTab, setTab] = useState<"Location" | "Data">("Location");
  const [imageView, setImageView] = useState(false);

  const themeColor = useThemeColor();

  const url = selectedTab === "Location" ? info.location : info.data;
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
