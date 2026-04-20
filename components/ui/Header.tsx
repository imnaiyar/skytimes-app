import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, useColorScheme, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../Themed";

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  bottomBorder?: boolean;
  style?: ViewStyle;
}
export function Header({
  title,
  right,
  bottomBorder,
  style = {},
}: HeaderProps) {
  const theme = Colors[useColorScheme() ?? "dark"];
  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.card,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.border,
            borderBottomWidth: bottomBorder ? 1 : 0,
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {right && right}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    alignContent: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
});
