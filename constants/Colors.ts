import { useColorScheme } from "@/components/useColorScheme";

const tintColorLight = "#6750A4";
const tintColorDark = "#D0BCFF";

const Colors = {
  light: {
    text: "#1C1B1F",
    mutedText: "#49454F",
    background: "#FFFBFE",
    card: "#FFFBFE",
    surface: "#FFFBFE",
    surfaceMuted: "#E7E0EC",
    border: "#CAC4D0",
    divider: "#CAC4D0",
    icon: "#49454F",
    iconMuted: "#79747E",
    tint: tintColorLight,
    success: "#7D5260",
    successSurface: "#FFD8E4",
    danger: "#B3261E",
    dangerSurface: "#F9DEDC",
    eventRowA: "#EADDFF",
    eventRowB: "#E8DEF8",
    overlay: "#0000005c",
    tabIconDefault: "#49454F",
    tabIconSelected: "#CAC4D0",
    link: tintColorLight,
  },
  dark: {
    text: "#E6E1E5",
    mutedText: "#8d8d8e",
    background: "#1C1B1F",
    card: "#343436",
    surface: "#1C1B1F",
    surfaceMuted: "#49454F",
    border: "#49454F",
    divider: "#49454F",
    icon: "#CAC4D0",
    iconMuted: "#938F99",
    tint: tintColorDark,
    success: "#7D5260",
    successSurface: "#FFD8E4",
    danger: "#F2B8B5",
    dangerSurface: "#8C1D18",
    eventRowA: "#3a3447",
    eventRowB: "#4A4458",
    overlay: "#0000005c",
    tabIconDefault: "#CAC4D0",
    tabIconSelected: "#49454F",
    link: tintColorDark,
  },
} as const;

export default Colors;

export function useThemeColor() {
  return Colors[useColorScheme()];
}
