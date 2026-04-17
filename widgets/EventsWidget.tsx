"use no memo";

import {
  FlexWidget,
  IconWidget,
  TextWidget,
  type WidgetRepresentation,
} from "react-native-android-widget";

import type { WidgetEventRow } from "./events-widget-data";
import { getWidgetEventRows } from "./events-widget-data";

type WidgetPalette = {
  background: `#${string}`;
  border: `#${string}`;
  text: `#${string}`;
  mutedText: `#${string}`;
  success: `#${string}`;
};

const LIGHT_PALETTE: WidgetPalette = {
  background: "#f8faff",
  border: "#d4def3",
  text: "#111827",
  mutedText: "#5c6b86",
  success: "#22c55e",
};

export const DARK_PALETTE: WidgetPalette = {
  background: "#111b2f",
  border: "#334665",
  text: "#e5edff",
  mutedText: "#9eb0cf",
  success: "#4ade80",
};

export function EventsWidget({
  rows,
  palette,
}: {
  rows: WidgetEventRow[];
  palette: WidgetPalette;
}) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <FlexWidget style={{ flexDirection: "row", width: "match_parent", justifyContent: "space-between", alignItems: "center",  padding: 4}}>
      <TextWidget
        text="Sky Events"
        style={{ color: palette.text, fontSize: 14, fontWeight: "700", marginBottom: 8 }}
      />
     <IconWidget font="material"  clickAction="REFRESH" size={30} style={{ color: palette.text }} icon="refresh" />
      </FlexWidget>
      <FlexWidget style={{ borderColor: palette.border, borderWidth: 0.5, width: "match_parent", marginBottom: 10 }} />

      {!rows.length && (
        <TextWidget
          text="No events available right now."
          style={{
            marginTop: 8,
            color: palette.mutedText,
            fontSize: 12,
          }}
        />
      )}

      {rows.map((row, index) => (
        <FlexWidget
          key={row.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: index === 0 ? 0 : 6,
            paddingBottom: 6,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: palette.border,
          }}
        >
          <FlexWidget style={{ flex: 1, paddingRight: 8 }}>
            <TextWidget
              text={row.name}
              maxLines={1}
              truncate="END"
              style={{
                color: palette.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            />
          </FlexWidget>

          <TextWidget
            text={row.statusLabel}
            style={{
              color: row.active ? palette.success : palette.mutedText,
              fontSize: 12,
              fontWeight: row.active ? "700" : "500",
            }}
          />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

export function renderEventsWidget(
  rows: WidgetEventRow[] = getWidgetEventRows(),
): WidgetRepresentation {
  return {
    light: <EventsWidget rows={rows} palette={LIGHT_PALETTE} />,
    dark: <EventsWidget rows={rows} palette={DARK_PALETTE} />,
  };
}
