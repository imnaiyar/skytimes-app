import SeasonDetailScreen from "@/components/seasons/SeasonDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function SeasonRoute() {
  const { seasonId } = useLocalSearchParams<{ seasonId?: string }>();

  return <SeasonDetailScreen seasonId={seasonId ?? ""} />;
}
