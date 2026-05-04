import { INode } from "@skyhelperbot/skygame-data";

export function getNodeCost(node: INode) {
  const types = ["c", "h", "sc", "sh", "ac", "ec"] as const;

  const type = types.find((t) => Object.hasOwn(node, t));
  return type ? { cost: node[type]!, type } : null;
}
