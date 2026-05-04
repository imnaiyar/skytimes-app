import Colors, { useThemeColor } from "@/constants/Colors";
import { currencyIconMappings } from "@/constants/common";
import { getNodeCost } from "@/utils/spirits";
import {
  ISeason,
  SpiritTreeHelper,
  type INode,
  type ISpiritTree,
} from "@skyhelperbot/skygame-data";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { RenderCosts } from "../spirit-tree/render-costs";
import { Text } from "../Themed";
import { useColorScheme } from "../useColorScheme";

type PositionedNode = {
  node: INode;
  x: number;
  y: number;
};

const NODE_WIDTH = 88;
const NODE_HEIGHT = 62;
const COLUMN_GAP = 15;
const ROW_GAP = 15;

export default function SpiritTreeRenderer({
  tree,
  season,
}: {
  tree?: ISpiritTree | null;
  season?: ISeason;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const nodes = SpiritTreeHelper.getNodes(tree ?? undefined);

  if (!tree) {
    return (
      <View
        style={[
          styles.emptyState,
          {
            backgroundColor: themeColors.eventRowB,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Text style={{ color: themeColors.mutedText }}>
          Tree data is not available for this spirit yet.
        </Text>
      </View>
    );
  }

  if (tree.tier) {
    const tiers = SpiritTreeHelper.getTiers(tree).reverse();

    return (
      <View
        style={[
          styles.treeBlock,
          styles.tierCard,
          {
            borderColor: themeColors.border,
          },
        ]}
      >
        <View
          style={[
            styles.tierHeader,
            {
              backgroundColor: themeColors.overlay,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
          <RenderCosts nodes={nodes} />
        </View>
        {tiers.map((tier, index) => (
          <View key={tier.guid}>
            <View>
              {[...tier.rows].reverse().map((row, rowIndex) => (
                <View key={`${tier.guid}:${rowIndex}`} style={styles.tierRow}>
                  {row.map((node, columnIndex) => (
                    <View
                      key={
                        node?.guid ?? `${tier.guid}:${rowIndex}:${columnIndex}`
                      }
                      style={styles.tierCell}
                    >
                      {node ? (
                        <TreeNodeCard node={node} compact season={season} />
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
            {index < tiers.length - 1 && (
              <View
                style={[
                  {
                    borderColor: themeColors.border,
                    borderWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  }

  if (!tree.node) {
    return null;
  }

  const positionedNodes = collectNodes(tree.node);
  const minX = Math.min(...positionedNodes.map((item) => item.x));
  const maxX = Math.max(...positionedNodes.map((item) => item.x));
  const maxY = Math.max(...positionedNodes.map((item) => item.y));
  const map = new Map(positionedNodes.map((item) => [item.node.guid, item]));
  const width = (maxX - minX + 1) * NODE_WIDTH + (maxX - minX) * COLUMN_GAP;
  const height = (maxY + 1) * NODE_HEIGHT + maxY * ROW_GAP;

  return (
    <View
      style={[
        styles.treeBlock,
        styles.tierCard,
        {
          borderColor: themeColors.border,
          alignItems: "center",
        },
      ]}
    >
      <View
        style={[
          styles.tierHeader,
          {
            backgroundColor: themeColors.overlay,
            borderBottomColor: themeColors.border,
            width: "100%",
          },
        ]}
      >
        <RenderCosts nodes={nodes} />
      </View>
      <View
        style={[
          {
            width,
            height,
          },
        ]}
      >
        {positionedNodes.map((item) => {
          const parent = item.node.prev ? map.get(item.node.prev.guid) : null;

          return parent ? (
            <Connector
              key={`line:${item.node.guid}`}
              fromX={centerX(parent.x - minX)}
              fromY={centerY(maxY - parent.y)}
              toX={centerX(item.x - minX)}
              toY={centerY(maxY - item.y)}
            />
          ) : null;
        })}

        {positionedNodes.map((item) => (
          <View
            key={item.node.guid}
            style={{
              left: leftPosition(item.x - minX),
              position: "absolute",
              top: topPosition(maxY - item.y),
            }}
          >
            <TreeNodeCard node={item.node} season={season} />
          </View>
        ))}
      </View>
    </View>
  );
}

function collectNodes(root: INode) {
  const placements = new Map<string, PositionedNode>();

  const visit = (node: INode | undefined, x: number, y: number) => {
    if (!node || placements.has(node.guid)) return;

    placements.set(node.guid, { node, x, y });
    visit(node.nw, x - 1, y + 1);
    visit(node.n, x, y + 1);
    visit(node.ne, x + 1, y + 1);
  };

  visit(root, 0, 0);

  return [...placements.values()];
}

function centerX(column: number) {
  return leftPosition(column) + NODE_WIDTH / 2;
}

function centerY(row: number) {
  return topPosition(row) + NODE_HEIGHT / 2;
}

function leftPosition(column: number) {
  return column * (NODE_WIDTH + COLUMN_GAP);
}

function topPosition(row: number) {
  return row * (NODE_HEIGHT + ROW_GAP);
}

function Connector({
  fromX,
  fromY,
  toX,
  toY,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: themeColors.border,
        borderRadius: 999,
        height: 1,
        left: (fromX + toX) / 2 - length / 2,
        position: "absolute",
        top: (fromY + toY) / 2 - 1.5,
        transform: [{ rotateZ: `${angle}deg` }],
        width: length,
      }}
    />
  );
}

function TreeNodeCard({
  node,
  compact = false,
  season,
}: {
  node: INode;
  compact?: boolean;
  season?: ISeason;
}) {
  const themeColors = useThemeColor();
  const item = node.item;
  const costs = getNodeCost(node);
  const url = item?.icon;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.nodeCard,
        compact && {
          ...styles.nodeCardCompact,
          backgroundColor: themeColors.overlay,

          borderColor: themeColors.border,
          borderWidth: 1,
        },
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {season &&
        season.iconUrl &&
        ["SeasonPass", "Ultimate"].includes(node.item?.group ?? "") && (
          <Image
            source={season.iconUrl}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              height: 20,
              width: 20,
              zIndex: 20,
            }}
          />
        )}
      <Image
        source={url}
        style={{ height: 40, width: 40 }}
        contentFit="contain"
      />

      {costs && (
        <View
          style={{
            position: "absolute",
            bottom: 3,
            alignItems: "center",
            left: 10,
            zIndex: 20,
            flexDirection: "row",
            gap: 1,
          }}
        >
          <Text style={{ fontSize: 10, color: "#fff" }}>{costs.cost}</Text>
          <Image
            source={currencyIconMappings[costs.type]}
            tintColor={
              ["sc", "sh"].includes(costs.type)
                ? themeColors.seasonCurrency
                : themeColors.currency
            }
            style={{
              height: 15,
              width: 15,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  normalTreeCanvas: {
    padding: 18,
  },
  nodeCard: {
    borderRadius: 18,
    minHeight: NODE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: NODE_WIDTH,
  },
  nodeCardCompact: {
    minHeight: 75,
    width: "80%",
  },
  nodeSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  tierCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  tierCell: {
    flex: 1,
    minHeight: 49,
  },
  tierHeader: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tierRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    padding: 10,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  treeBlock: {
    gap: 12,
  },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
