import SeasonsScreen from "@/components/seasons/SeasonsScreen";
import { Stack } from "expo-router";

export default function SeasonsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Seasons" }} />
      <SeasonsScreen />
    </>
  );
}
