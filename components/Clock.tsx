import { useNow } from "@/utils/hooks";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DateTime } from "luxon";
import { Image, StyleSheet } from "react-native";
import { Text, View } from "./Themed";
export function SkyClock() {
  const now = useNow();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const [local, ingame] = [
    DateTime.fromMillis(now),
    DateTime.fromMillis(now, { zone: "America/Los_Angeles" }),
  ].map((date) => date.toFormat("hh:mm a"));

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={[styles.header, { color: themeColors.text }]}>Clock</Text>

        <Image
          source={require("../assets/images/skykid.png")}
          style={styles.skykid}
          resizeMode="contain"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 50,
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 5, alignItems: "center" }}>
          <Text style={styles.timer}>{local}</Text>
          <Text style={[styles.label, { color: themeColors.mutedText }]}>
            (Local)
          </Text>
        </View>
        <View style={{ gap: 5, alignItems: "center" }}>
          <Text style={styles.timer}>{ingame}</Text>
          <Text style={[styles.label, { color: themeColors.mutedText }]}>
            (InGame - LA)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    padding: 20,
    margin: 10,
  },

  headerWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  skykid: {
    position: "absolute",
    width: "70%",
    height: "70%",

    top: -25,
    right: -20,
  },

  header: {
    fontWeight: "900",
    fontSize: 100,
  },

  timer: { fontWeight: "400", fontSize: 30 },

  label: { fontWeight: "200", fontSize: 15 },
});
