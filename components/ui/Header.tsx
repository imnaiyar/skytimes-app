import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../Themed";
import { useColorScheme } from "../useColorScheme";

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  leftIcon?: string;
  bottomBorder?: boolean;
  style?: ViewStyle;
}
export function Header({
  title,
  right,
  bottomBorder = true,
  leftIcon,
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          {leftIcon && (
            <Image
              source={leftIcon}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
              }}
            />
          )}
          <Text style={[styles.title, { elevation: 4, color: theme.tint }]}>
            {title}
          </Text>
        </View>
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
    fontSize: 22,
    fontWeight: "bold",
  },
});
