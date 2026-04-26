import { useThemeColor } from "@/constants/Colors";
import { EvilIcons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../Themed";

export default function QuestSource({
  credit,
  source,
}: {
  credit?: string;
  source?: string;
}) {
  const themeColor = useThemeColor();
  const styles = sst(themeColor);

  return (
    <View style={styles.creditRow}>
      {credit ? (
        <Text style={[styles.creditText, { color: themeColor.mutedText }]}>
          {credit}
        </Text>
      ) : null}
      {credit && source ? (
        <Text style={[styles.creditText, styles.creditBullet]}>{"\u2022"}</Text>
      ) : null}
      {source ? (
        <Pressable
          onPress={() => {
            Linking.openURL(source).catch(() => undefined);
          }}
          style={{ flexDirection: "row" }}
        >
          <Text style={[styles.sourceText, { color: themeColor.link }]}>
            Source
          </Text>
          <EvilIcons name="external-link" color={themeColor.link} size={11} />
        </Pressable>
      ) : null}
    </View>
  );
}

const sst = (themeColor: ReturnType<typeof useThemeColor>) =>
  StyleSheet.create({
    creditRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    creditText: {
      color: themeColor.mutedText,
      fontSize: 11,
      lineHeight: 16,
    },
    creditBullet: {
      marginHorizontal: 2,
    },
    sourceText: {
      fontSize: 11,
      lineHeight: 16,
      textDecorationLine: "underline",
    },
  });
