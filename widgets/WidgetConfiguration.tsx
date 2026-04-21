import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useWidgetSettings } from "@/utils/hooks";
import {
  Button,
  Card,
  Column,
  FilterChip,
  FlowRow,
  Host,
  LazyColumn,
  Row,
  Switch,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { EventKey, SkytimesUtils } from "@skyhelperbot/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WidgetConfigurationScreenProps,
  WidgetPreview,
} from "react-native-android-widget";
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

  const theme = Colors[useColorScheme()];

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

  const handleToggleEnabled = useCallback((value: boolean) => {
    setLocalEnabled(value);
    if (value) {
      setLocalSelectedKeys(DEFAULT_6_EVENTS);
    } else {
      setLocalSelectedKeys([]);
    }
  }, []);

  return (
    <Host style={{ flex: 1 }}>
      <Column
        modifiers={[fillMaxWidth(), paddingAll(12), padding(0, 15, 0, 0)]}
      >
        <LazyColumn
          modifiers={[fillMaxWidth(), weight(1)]}
          verticalArrangement={{ spacedBy: 16 }}
        >
          {/* Header Section */}
          <Column
            verticalArrangement={{ spacedBy: 4 }}
            modifiers={[fillMaxWidth(), padding(0, 8, 0, 8)]}
          >
            <Text
              color={theme.text}
              style={{
                typography: "titleLarge",
              }}
            >
              Display custom events on the widget?
            </Text>
            <Text
              color={theme.mutedText}
              style={{
                typography: "labelSmall",
              }}
            >
              Choose which event shows up on the widget
            </Text>
          </Column>

          {/* Enable/Disable Chip */}
          <Card border={{ width: 1 }} modifiers={[fillMaxWidth()]}>
            <Row
              modifiers={[fillMaxWidth(), paddingAll(8)]}
              verticalAlignment="center"
              horizontalArrangement={"spaceBetween"}
            >
              <Text>Enable Custom Events?</Text>
              <Switch
                value={localEnabled}
                onCheckedChange={(v) => setLocalEnabled(v)}
              />
            </Row>
          </Card>

          {/* Events Selection */}
          <Column
            verticalArrangement={{ spacedBy: 8 }}
            modifiers={[fillMaxWidth()]}
          >
            <Text
              color={theme.text}
              style={{
                typography: "labelMedium",
              }}
            >
              Select Events (2-6)
            </Text>
            <FlowRow horizontalArrangement={{ spacedBy: 8 }}>
              {event.map(([key, eventData]) => {
                const isSelected = selectedSet.has(key);
                const isDisabledState = isDisabled(key);
                return (
                  <FilterChip
                    key={key}
                    selected={isSelected}
                    onClick={() => {
                      if (!isDisabledState) {
                        toggleSelectEvent(key);
                      }
                    }}
                    enabled={!isDisabledState}
                  >
                    <FilterChip.Label>
                      <Text>{eventData.event.name}</Text>
                    </FilterChip.Label>
                  </FilterChip>
                );
              })}
            </FlowRow>
          </Column>

          <Text color={theme.text} style={{ typography: "labelLarge" }}>
            Preview
          </Text>
          <WidgetPreview
            renderWidget={() => (
              <EventsWidget
                rows={getWidgetEventRows(undefined, localSelectedKeys)}
                palette={DARK_PALETTE}
              />
            )}
            height={220}
            width={320}
          />
        </LazyColumn>

        <Row
          horizontalArrangement={{ spacedBy: 15 }}
          modifiers={[fillMaxWidth(), paddingAll(16)]}
        >
          <Button onClick={() => setResult("cancel")}>
            <Text color={theme.background}>Cancel</Text>
          </Button>
          <Button
            colors={{
              containerColor: theme.success,
              contentColor: theme.background,
            }}
            onClick={() => {
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
          >
            <Text>Save</Text>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}
