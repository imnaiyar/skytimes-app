import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import EnhancedImageViewing from "react-native-image-viewing";

export default function ImageView({ url }: { url: string }) {
  const [imageView, setImageView] = useState(false);
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <View style={{ width: "100%", padding: 10 }}>
      <Pressable onPress={() => setImageView(true)}>
        <Image
          source={url}
          loading="lazy"
          placeholder={{ blurhash }}
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
  );
}
