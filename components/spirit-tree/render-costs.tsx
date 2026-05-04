import { useThemeColor } from "@/constants/Colors";
import { currencyIconMappings } from "@/constants/common";
import { getNodeCost } from "@/utils/spirits";
import { ICost, INode } from "@skyhelperbot/skygame-data";
import { Image } from "expo-image";
import { Text, View } from "react-native";

export function RenderCosts({ nodes }: { nodes: INode[] }) {
  const costs = nodes
    .map(getNodeCost)
    .filter((s) => !!s)
    .reduce((acc, curr) => {
      acc[curr.type] ??= 0;
      acc[curr.type] += curr.cost;
      return acc;
    }, {} as Required<ICost>);

  const themeColors = useThemeColor();
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {Object.entries(costs).map(([type, amount]) => {
        return (
          <View
            key={type}
            style={{
              flexDirection: "row",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#fff" }}>{amount}</Text>
            <Image
              source={currencyIconMappings[type as keyof ICost]}
              tintColor={
                ["sc", "sh"].includes(type)
                  ? themeColors.seasonCurrency
                  : themeColors.currency
              }
              style={{
                height: 20,
                width: 20,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
