import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  MAX_NOTIFICATION_OFFSET_MINUTES,
  MIN_NOTIFICATION_OFFSET_MINUTES,
  NOTIFICATION_OFFSET_STEP_MINUTES,
  clampNotificationOffsetMinutes,
} from "@/utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type OffsetPickerModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  initialOffsetMinutes: number;
  onCancel: () => void;
  onSave: (offsetMinutes: number) => void;
};

const TRACK_THUMB_SIZE = 22;

export function OffsetPickerModal({
  visible,
  title,
  description,
  initialOffsetMinutes,
  onCancel,
  onSave,
}: OffsetPickerModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const [offsetMinutes, setOffsetMinutes] = useState(
    clampNotificationOffsetMinutes(initialOffsetMinutes),
  );
  const [trackWidth, setTrackWidth] = useState(1);
  const range =
    MAX_NOTIFICATION_OFFSET_MINUTES - MIN_NOTIFICATION_OFFSET_MINUTES;

  useEffect(() => {
    if (!visible) return;
    setOffsetMinutes(clampNotificationOffsetMinutes(initialOffsetMinutes));
  }, [initialOffsetMinutes, visible]);

  const isMinusDisabled = offsetMinutes <= MIN_NOTIFICATION_OFFSET_MINUTES;
  const isPlusDisabled = offsetMinutes >= MAX_NOTIFICATION_OFFSET_MINUTES;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: themeColors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            {title}
          </Text>
          {description ? (
            <Text
              style={[styles.description, { color: themeColors.mutedText }]}
            >
              {description}
            </Text>
          ) : null}

          <View style={styles.valueRow}>
            <Pressable
              onPress={() =>
                setOffsetMinutes(
                  offsetMinutes - NOTIFICATION_OFFSET_STEP_MINUTES,
                )
              }
              disabled={isMinusDisabled}
              style={[
                styles.iconButton,
                { backgroundColor: themeColors.surfaceMuted },
                isMinusDisabled && styles.iconButtonDisabled,
              ]}
            >
              <Ionicons name="remove" size={18} color={themeColors.icon} />
            </Pressable>

            <Text style={[styles.valueText, { color: themeColors.text }]}>
              {offsetMinutes}m
            </Text>

            <Pressable
              onPress={() =>
                setOffsetMinutes(
                  offsetMinutes + NOTIFICATION_OFFSET_STEP_MINUTES,
                )
              }
              disabled={isPlusDisabled}
              style={[
                styles.iconButton,
                { backgroundColor: themeColors.surfaceMuted },
                isPlusDisabled && styles.iconButtonDisabled,
              ]}
            >
              <Ionicons name="add" size={18} color={themeColors.icon} />
            </Pressable>
          </View>

          <Slider
            style={{ height: 40 }}
            minimumValue={MIN_NOTIFICATION_OFFSET_MINUTES}
            maximumValue={MAX_NOTIFICATION_OFFSET_MINUTES}
            minimumTrackTintColor={themeColors.tint}
            maximumTrackTintColor={themeColors.tabIconSelected}
            onValueChange={setOffsetMinutes}
            step={NOTIFICATION_OFFSET_STEP_MINUTES}
            value={offsetMinutes}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[
                styles.actionButton,
                { backgroundColor: themeColors.surfaceMuted },
              ]}
            >
              <Text style={[styles.actionText, { color: themeColors.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onSave(clampNotificationOffsetMinutes(offsetMinutes))
              }
              style={[
                styles.actionButton,
                { backgroundColor: themeColors.success },
              ]}
            >
              <Text
                style={[styles.actionText, { color: themeColors.background }]}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  valueText: {
    fontSize: 26,
    fontWeight: "800",
    minWidth: 72,
    textAlign: "center",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 999,
    position: "relative",
    overflow: "visible",
  },
  sliderFilled: {
    height: 6,
    borderRadius: 999,
  },
  sliderThumb: {
    position: "absolute",
    top: -(TRACK_THUMB_SIZE / 2 - 3),
    width: TRACK_THUMB_SIZE,
    height: TRACK_THUMB_SIZE,
    borderRadius: TRACK_THUMB_SIZE / 2,
    borderWidth: 2,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionText: {
    fontWeight: "700",
  },
});
