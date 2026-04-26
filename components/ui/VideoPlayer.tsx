import { useFocusEffect } from "expo-router";
import { RefObject, useCallback } from "react";
import { StyleSheet } from "react-native";
import Video, { VideoRef } from "react-native-video";
import { View } from "../Themed";

export default function VideoPlayer({
  uri,
  ref,
}: {
  uri: string;
  ref: RefObject<VideoRef | null>;
}) {
  useFocusEffect(
    useCallback(() => {
      // pause when page is changed to avoid background playing
      return () => {
        ref?.current?.pause();
      };
    }, []),
  );
  return (
    <View style={styles.container}>
      <Video ref={ref} source={{ uri }} style={styles.video} controls paused />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
});
