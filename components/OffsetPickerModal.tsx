import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  MAX_NOTIFICATION_OFFSET_MINUTES,
  MIN_NOTIFICATION_OFFSET_MINUTES,
  NOTIFICATION_OFFSET_STEP_MINUTES,
  clampNotificationOffsetMinutes,
} from "@/utils/storage";
import {
  BasicAlertDialog,
  Button,
  Card,
  Column,
  Host,
  IconButton,
  Row,
  Slider,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useState } from "react";

type OffsetPickerModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  initialOffsetMinutes: number;
  onCancel: () => void;
  onSave: (offsetMinutes: number) => void;
};

export function OffsetPickerModal({
  visible,
  title,
  description,
  initialOffsetMinutes,
  onCancel,
  onSave,
}: OffsetPickerModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const [offsetMinutes, setOffsetMinutes] = useState(
    clampNotificationOffsetMinutes(initialOffsetMinutes),
  );

  useEffect(() => {
    if (!visible) return;
    setOffsetMinutes(clampNotificationOffsetMinutes(initialOffsetMinutes));
  }, [initialOffsetMinutes, visible]);

  const isMinusDisabled = offsetMinutes <= MIN_NOTIFICATION_OFFSET_MINUTES;
  const isPlusDisabled = offsetMinutes >= MAX_NOTIFICATION_OFFSET_MINUTES;

  if (!visible) return null;

  return (
    <Host style={{ flex: 1 }}>
      <BasicAlertDialog
        onDismissRequest={onCancel}
        properties={{ dismissOnBackPress: true, dismissOnClickOutside: true }}
        modifiers={[fillMaxWidth()]}
      >
        <Card
          colors={{ containerColor: themeColors.card }}
          border={{ color: themeColors.border, width: 1 }}
          modifiers={[fillMaxWidth()]}
        >
          <Column
            verticalArrangement={{ spacedBy: 8 }}
            modifiers={[fillMaxWidth(), paddingAll(15)]}
          >
            {/* Title */}
            <Text
              color={themeColors.text}
              style={{
                typography: "titleMedium",
              }}
            >
              {title}
            </Text>

            {description ? (
              <Text
                color={themeColors.mutedText}
                style={{
                  typography: "bodySmall",
                }}
              >
                {description}
              </Text>
            ) : null}

            {/* Value Row with minus/plus buttons */}
            <Row
              horizontalArrangement="spaceEvenly"
              modifiers={[fillMaxWidth()]}
            >
              <IconButton
                onClick={() =>
                  setOffsetMinutes(
                    offsetMinutes - NOTIFICATION_OFFSET_STEP_MINUTES,
                  )
                }
                enabled={!isMinusDisabled}
                colors={{
                  containerColor: themeColors.surfaceMuted,
                  contentColor: themeColors.icon,
                  disabledContainerColor: themeColors.surfaceMuted,
                  disabledContentColor: themeColors.iconMuted,
                }}
              >
                <Text style={{ typography: "bodyLarge" }}>−</Text>
              </IconButton>

              <Text
                color={themeColors.text}
                style={{
                  typography: "headlineMedium",
                }}
              >
                {offsetMinutes}m
              </Text>

              <IconButton
                onClick={() =>
                  setOffsetMinutes(
                    offsetMinutes + NOTIFICATION_OFFSET_STEP_MINUTES,
                  )
                }
                enabled={!isPlusDisabled}
                colors={{
                  containerColor: themeColors.surfaceMuted,
                  contentColor: themeColors.icon,
                  disabledContainerColor: themeColors.surfaceMuted,
                  disabledContentColor: themeColors.iconMuted,
                }}
              >
                <Text style={{ typography: "bodyLarge" }}>+</Text>
              </IconButton>
            </Row>

            <Slider
              min={MIN_NOTIFICATION_OFFSET_MINUTES}
              max={MAX_NOTIFICATION_OFFSET_MINUTES}
              colors={{
                activeTrackColor: themeColors.tint,
                inactiveTrackColor: themeColors.tabIconSelected,
                activeTickColor: themeColors.divider,
                inactiveTickColor: themeColors.iconMuted,
              }}
              steps={MAX_NOTIFICATION_OFFSET_MINUTES}
              value={offsetMinutes}
              onValueChange={(v) => setOffsetMinutes(Math.round(v))}
            />

            {/* Action Buttons */}
            <Row horizontalArrangement="center" modifiers={[fillMaxWidth()]}>
              <TextButton
                onClick={onCancel}
                colors={{
                  contentColor: themeColors.text,
                }}
              >
                <Text
                  color={themeColors.text}
                  style={{
                    typography: "labelLarge",
                  }}
                >
                  Cancel
                </Text>
              </TextButton>
              <Button
                onClick={() =>
                  onSave(clampNotificationOffsetMinutes(offsetMinutes))
                }
                colors={{
                  containerColor: themeColors.successSurface,
                  contentColor: themeColors.background,
                }}
              >
                <Text
                  color={themeColors.background}
                  style={{
                    typography: "labelLarge",
                  }}
                >
                  Save
                </Text>
              </Button>
            </Row>
          </Column>
        </Card>
      </BasicAlertDialog>
    </Host>
  );
}
