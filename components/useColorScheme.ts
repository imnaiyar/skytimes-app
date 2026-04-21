import { useColorScheme as useColor } from "react-native";

export function useColorScheme() {
  const scheme = useColor();
  return scheme === "unspecified" ? "dark" : scheme;
}
