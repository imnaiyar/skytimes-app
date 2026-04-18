import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useWidgetSettings } from "@/utils/hooks";
import { EventKey, SkytimesUtils } from "@skyhelperbot/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, StyleSheet, Switch, useColorScheme } from "react-native";
import { WidgetConfigurationScreenProps } from "react-native-android-widget";
import { getWidgetEventRows } from "./events-widget-data";
import { DARK_PALETTE, EventsWidget } from "./EventsWidget";

const MAX_WIDGET_EVENTS = 6;
const DEFAULT_6_EVENTS: EventKey[] = [
  "geyser",
  "grandma",
  "turtle",
  "daily-reset",
  "eden",
  "aurora",
];
export function WidgetConfigurationScreen({
  widgetInfo,
  setResult,
  renderWidget,
}: WidgetConfigurationScreenProps) {
  const { widgetSettings, updateWidgetSettings } = useWidgetSettings();

  // Local state for the configuration
  const [localEnabled, setLocalEnabled] = useState(false);
  const [localSelectedKeys, setLocalSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    function init() {
      setLocalEnabled(widgetSettings.enabled);
      setLocalSelectedKeys(widgetSettings.selectedEventKeys);
    }
    init();
  }, [widgetSettings]);

  const event = SkytimesUtils.allEventDetails();
  const selectedSet = useMemo(
    () => new Set(localSelectedKeys),
    [localSelectedKeys],
  );

  const theme = Colors[useColorScheme() ?? "dark"];

  const isDisabled = useCallback(
    (key: string) =>
      !localEnabled ||
      (!selectedSet.has(key) && selectedSet.size >= MAX_WIDGET_EVENTS) ||
      (selectedSet.has(key) && selectedSet.size <= 2),
    [localEnabled, selectedSet],
  );

  const toggleSelectEvent = useCallback(
    (key: string) => {
      const newSelectedKeys = Array.from(selectedSet);
      const isSelected = newSelectedKeys.includes(key);

      if (isSelected) {
        newSelectedKeys.splice(newSelectedKeys.indexOf(key), 1);
      } else {
        if (newSelectedKeys.length >= MAX_WIDGET_EVENTS) return;
        newSelectedKeys.push(key);
      }

      setLocalSelectedKeys(newSelectedKeys);
    },
    [selectedSet],
  );

  const warning = useMemo(
    () =>
      selectedSet.size >= 6
        ? "Max 6 events can be selected to display on the widget"
        : selectedSet.size <= 2
          ? "Min. 2 events should be selected to show on the widget"
          : null,
    [selectedSet.size],
  );

  const handleToggleEnabled = useCallback((value: boolean) => {
    setLocalEnabled(value);
    if (value) {
      setLocalSelectedKeys(DEFAULT_6_EVENTS);
    } else {
      setLocalSelectedKeys([]);
    }
  }, []);

  return (
    <View style={style.container}>
      <View
        style={{
          ...style.row,
          marginBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          paddingBottom: 8,
        }}
      >
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Display custom events on the widget?
          </Text>
          <Text style={{ fontSize: 10, color: theme.mutedText }}>
            Choose which event shows up on the widget.
          </Text>
        </View>
        <Switch value={localEnabled} onValueChange={handleToggleEnabled} />
      </View>
      {warning && localEnabled && (
        <Text style={{ color: theme.danger, fontSize: 10, textAlign: "left" }}>
          {warning}
        </Text>
      )}
      <View style={{ padding: 10, marginBottom: 10 }}>
        {event.map(([key, event]) => {
          return (
            <View key={key} style={{ ...style.row, marginBottom: 10 }}>
              <Text>{event.event.name}</Text>
              <Switch
                value={selectedSet.has(key)}
                disabled={isDisabled(key)}
                onValueChange={() => toggleSelectEvent(key)}
              />
            </View>
          );
        })}
      </View>

      <View style={style.actions}>
        <Button
          title={"Cancel"}
          color={theme.iconMuted}
          onPress={() => setResult("cancel")}
        />
        <Button
          title={"Save"}
          color={theme.success}
          onPress={() => {
            const config = {
              enabled: localEnabled,
              selectedEventKeys: localSelectedKeys,
            };
            const rows = config.enabled
              ? getWidgetEventRows(undefined, config.selectedEventKeys)
              : getWidgetEventRows();

            renderWidget(<EventsWidget rows={rows} palette={DARK_PALETTE} />);

            updateWidgetSettings(config);

            setResult("ok");
          }}
        />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
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
