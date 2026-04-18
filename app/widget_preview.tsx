import { useWidgetSettings } from "@/utils/hooks";
import { getWidgetEventRows } from "@/widgets/events-widget-data";
import { DARK_PALETTE, EventsWidget } from "@/widgets/EventsWidget";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { WidgetPreview } from "react-native-android-widget";

export default function HelloWidgetPreviewScreen() {
  const { widgetSettings } = useWidgetSettings();
  const rows = getWidgetEventRows(
    undefined,
    widgetSettings.enabled ? widgetSettings.selectedEventKeys : undefined,
  );
  return (
    <View style={styles.container}>
      <WidgetPreview
        renderWidget={() => <EventsWidget rows={rows} palette={DARK_PALETTE} />}
        width={320}
        height={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
