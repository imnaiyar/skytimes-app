import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useWidgetSettings } from "@/utils/hooks";
import {
  Box,
  Button,
  Checkbox,
  Column,
  FilterChip,
  FlowRow,
  HorizontalDivider,
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
import { EventsWidget } from "./EventsWidget";

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
  const [showClickArea, setClickArea] = useState(false);
  return (
    <Host style={{ flex: 1, backgroundColor: theme.background }}>
      <Column
        modifiers={[fillMaxWidth(), paddingAll(12), padding(0, 20, 0, 0)]}
        horizontalAlignment="center"
      >
        <WidgetPreview
          highlightClickableAreas={showClickArea}
          renderWidget={() => (
            <EventsWidget
              rows={getWidgetEventRows(undefined, localSelectedKeys)}
              palette={Colors["dark"]}
            />
          )}
          height={220}
          width={320}
        />
        <Box contentAlignment="topEnd">
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 3 }}
          >
            <Text color={theme.mutedText} style={{ typography: "bodySmall" }}>
              Show clickable area?
            </Text>
            <Checkbox value={showClickArea} onCheckedChange={setClickArea} />
          </Row>
        </Box>
        <HorizontalDivider color={theme.border} />
        <LazyColumn
          modifiers={[fillMaxWidth(), weight(1)]}
          verticalArrangement={{ spacedBy: 16 }}
        >
          {/* Header Section */}

          <Row
            modifiers={[fillMaxWidth(), padding(0, 8, 0, 8)]}
            verticalAlignment="center"
            horizontalArrangement={"spaceBetween"}
          >
            <Column verticalArrangement={{ spacedBy: 4 }}>
              <Text
                color={theme.text}
                style={{
                  typography: "titleLarge",
                }}
              >
                Display custom events?
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
            <Switch
              value={localEnabled}
              colors={{
                checkedTrackColor: theme.tint,
                checkedThumbColor: theme.border,
                uncheckedTrackColor: theme.overlay,
                uncheckedThumbColor: theme.divider,
                uncheckedBorderColor: theme.divider,
              }}
              onCheckedChange={handleToggleEnabled}
            />
          </Row>

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
                    colors={{
                      selectedContainerColor: theme.success,

                      containerColor: theme.overlay,
                    }}
                    enabled={!isDisabledState}
                  >
                    <FilterChip.Label>
                      <Text
                        color={isDisabledState ? theme.mutedText : theme.text}
                      >
                        {eventData.event.name}
                      </Text>
                    </FilterChip.Label>
                  </FilterChip>
                );
              })}
            </FlowRow>
          </Column>
        </LazyColumn>

        <Row
          horizontalArrangement={{ spacedBy: 15 }}
          modifiers={[fillMaxWidth(), paddingAll(16)]}
        >
          <Button
            colors={{
              containerColor: theme.card,
            }}
            onClick={() => setResult("cancel")}
          >
            <Text color={theme.text}>Cancel</Text>
          </Button>
          <Button
            colors={{
              containerColor: theme.success,
            }}
            onClick={() => {
              const config = {
                enabled: localEnabled,
                selectedEventKeys: localSelectedKeys,
              };
              const rows = config.enabled
                ? getWidgetEventRows(undefined, config.selectedEventKeys)
                : getWidgetEventRows();

              renderWidget(
                <EventsWidget rows={rows} palette={Colors["dark"]} />,
              );

              updateWidgetSettings(config);

              setResult("ok");
            }}
          >
            <Text color={theme.text}>Save</Text>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}
