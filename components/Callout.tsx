import React from "react";
import { useColorScheme } from "@/components/useColorScheme";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

type CalloutVariant = "info" | "success" | "warning" | "error" | "neutral";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  bodyStyle?: StyleProp<TextStyle>;
}

type CalloutTone = {
  bg: string;
  border: string;
  accent: string;
  titleColor: string;
  bodyColor: string;
  iconTextColor: string;
  defaultIcon: string;
};

const CONFIG: Record<
  CalloutVariant,
  CalloutTone
> = {
  info: {
    bg: "#e8f0ff",
    border: "#b7caea",
    accent: "#3b82f6",
    titleColor: "#1d3b75",
    bodyColor: "#2f4b71",
    iconTextColor: "#e8f0ff",
    defaultIcon: "ℹ",
  },
  success: {
    bg: "#ebf9ef",
    border: "#b8e8c6",
    accent: "#22c55e",
    titleColor: "#0d6730",
    bodyColor: "#146338",
    iconTextColor: "#eafff0",
    defaultIcon: "✓",
  },
  warning: {
    bg: "#fff8e7",
    border: "#eedaa7",
    accent: "#f59e0b",
    titleColor: "#91550d",
    bodyColor: "#7a4a12",
    iconTextColor: "#1f2937",
    defaultIcon: "⚠",
  },
  error: {
    bg: "#fff0f4",
    border: "#f1c4d1",
    accent: "#f43f5e",
    titleColor: "#a3143d",
    bodyColor: "#8e183c",
    iconTextColor: "#ffeef2",
    defaultIcon: "✕",
  },
  neutral: {
    bg: "#f3f7ff",
    border: "#d0daeb",
    accent: "#64748b",
    titleColor: "#334155",
    bodyColor: "#465973",
    iconTextColor: "#eef3ff",
    defaultIcon: "•",
  },
};

const DARK_CONFIG: Record<CalloutVariant, CalloutTone> = {
  info: {
    bg: "#1b304b",
    border: "#34577e",
    accent: "#60a5fa",
    titleColor: "#dcebff",
    bodyColor: "#c7dbf7",
    iconTextColor: "#102338",
    defaultIcon: "ℹ",
  },
  success: {
    bg: "#1a3324",
    border: "#2b5a3b",
    accent: "#4ade80",
    titleColor: "#dcfce7",
    bodyColor: "#c4f2d5",
    iconTextColor: "#10301f",
    defaultIcon: "✓",
  },
  warning: {
    bg: "#3b2f17",
    border: "#6a5120",
    accent: "#fbbf24",
    titleColor: "#ffe9bd",
    bodyColor: "#f9dc9e",
    iconTextColor: "#3b2f17",
    defaultIcon: "⚠",
  },
  error: {
    bg: "#3d1f2a",
    border: "#6f3047",
    accent: "#fb7185",
    titleColor: "#ffe2ea",
    bodyColor: "#f5c7d4",
    iconTextColor: "#3d1f2a",
    defaultIcon: "✕",
  },
  neutral: {
    bg: "#1b2940",
    border: "#334866",
    accent: "#94a3b8",
    titleColor: "#e1e9f6",
    bodyColor: "#c7d4e8",
    iconTextColor: "#1b2940",
    defaultIcon: "•",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
  icon,
  style,
  titleStyle,
  bodyStyle,
}: CalloutProps) {
  const colorScheme = useColorScheme();
  const cfg = (colorScheme === "dark" ? DARK_CONFIG : CONFIG)[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          borderLeftColor: cfg.accent,
        },
        style,
      ]}
    >
      <View style={styles.iconWrapper}>
        {icon ?? (
          <View style={[styles.iconBadge, { backgroundColor: cfg.accent }]}>
            <Text style={[styles.iconText, { color: cfg.iconTextColor }]}>
              {cfg.defaultIcon}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {title ? (
          <Text
            style={[styles.title, { color: cfg.titleColor }, titleStyle]}
            numberOfLines={2}
          >
            {title}
          </Text>
        ) : null}
        {typeof children === "string" ? (
          <Text style={[styles.body, { color: cfg.bodyColor }, bodyStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrapper: {
    paddingTop: 1,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "400",
  },
});
