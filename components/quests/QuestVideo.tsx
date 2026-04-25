import { RNHostView } from "@expo/ui/jetpack-compose";
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "../Themed";

export default function QuestVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer({ useCaching: true, uri }, (player) => {
    player.play();
  });

  return (
    <RNHostView matchContents>
      <View style={{ width: "100%", padding: 10 }}>
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
      </View>
    </RNHostView>
  );
}
