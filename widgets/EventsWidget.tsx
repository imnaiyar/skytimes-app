"use no memo";

import {
  FlexWidget,
  IconWidget,
  TextWidget,
  type WidgetRepresentation,
} from "react-native-android-widget";

import Colors from "@/constants/Colors";
import { DateTime } from "luxon";
import type { WidgetEventRow } from "./events-widget-data";
import { getWidgetEventRows } from "./events-widget-data";

export function EventsWidget({
  rows,
  palette,
}: {
  rows: WidgetEventRow[];
  palette: (typeof Colors)["dark"] | (typeof Colors)["light"];
}) {
  const grouped = rows.reduce<WidgetEventRow[][]>((acc, _, i) => {
    if (i % 2 === 0) acc.push(rows.slice(i, i + 2));
    return acc;
  }, []);

  const generateStatusLabel = (row: WidgetEventRow, isRight = false) => {
    return (
      <FlexWidget
        key={row.name}
        style={{
          flex: 1,
          alignItems: isRight ? "flex-end" : "flex-start",
        }}
      >
        <TextWidget
          text={row.name}
          maxLines={1}
          truncate="END"
          style={{
            color: palette.text,
            fontSize: 12,
            fontWeight: "600",
            textAlign: isRight ? "right" : "left",
          }}
        />

        <TextWidget
          text={row.statusLabel}
          style={{
            color: row.active ? palette.success : palette.mutedText,
            fontSize: 12,
            fontWeight: row.active ? "700" : "500",
            textAlign: isRight ? "right" : "left",
          }}
        />
      </FlexWidget>
    );
  };
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
      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 4,
        }}
      >
        <FlexWidget style={{ flexGap: 2 }}>
          <TextWidget
            text="Sky Events"
            style={{ color: palette.text, fontSize: 14, fontWeight: "700" }}
          />
          <TextWidget
            text={`Last Updated: ${DateTime.now().toFormat("hh:mm a")}`}
            style={{
              color: palette.mutedText,
              fontSize: 10,
              fontWeight: "500",
              marginBottom: 8,
            }}
          />
        </FlexWidget>
        <IconWidget
          font="material"
          clickAction="REFRESH"
          size={30}
          style={{ color: palette.text }}
          icon="refresh"
        />
      </FlexWidget>
      <FlexWidget
        style={{
          borderColor: palette.border,
          borderWidth: 0.5,
          width: "match_parent",
          marginBottom: 10,
        }}
      />

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

      {grouped.map((row, index) => (
        <FlexWidget
          key={index}
          style={{
            flexDirection: "row",
            width: "match_parent",
            paddingTop: index === 0 ? 0 : 6,
            paddingBottom: 6,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: palette.border,
            borderStyle: "dotted",
          }}
        >
          {row.map((item, idx) => generateStatusLabel(item, idx === 1))}
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

export function renderEventsWidget(
  rows: WidgetEventRow[] = getWidgetEventRows(),
): WidgetRepresentation {
  return {
    light: <EventsWidget rows={rows} palette={Colors["light"]} />,
    dark: <EventsWidget rows={rows} palette={Colors["dark"]} />,
  };
}
