import { useThemeColor } from "@/constants/Colors";
import { useDebugMode, useReorderMode } from "@/utils/hooks";
import { Entypo, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { Header } from "../ui/Header";

export default function EventHeader() {
  const { reorder, setReorder } = useReorderMode();
  const { DEBUG } = useDebugMode();

  const themeColors = useThemeColor();

  return (
    <Header
      title={reorder ? "Re-ordering..." : "SkyTimes"}
      bottomBorder
      right={
        <View
          style={{
            gap: 4,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          {DEBUG && (
            <Link href="/debug" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Entypo
                    name="code"
                    size={20}
                    color={themeColors.text}
                    style={{
                      marginRight: 15,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                )}
              </Pressable>
            </Link>
          )}

          {!reorder && (
            <Link href="/instruction" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={20}
                    color={themeColors.text}
                    style={{
                      marginRight: 15,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                )}
              </Pressable>
            </Link>
          )}
          <Pressable onPress={() => setReorder(!reorder)}>
            <FontAwesome6
              name="arrow-down-wide-short"
              size={20}
              color={themeColors.text}
            />
          </Pressable>
        </View>
      }
    />
  );
}
