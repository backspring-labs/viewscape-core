import type { Node } from "../entities/node.js";
import type { TerrainGraph } from "../graph/graph.js";

/**
 * Resolve a node's position for a given perspective.
 * Returns null if the node has no layout defined for that perspective.
 */
export function resolveNodePositionInPerspective(
	node: Node,
	perspectiveId: string,
): { x: number; y: number } | null {
	return node.layoutByPerspective[perspectiveId] ?? null;
}

/**
 * Find a node in the graph that could serve as an equivalent anchor
 * when switching perspectives. Returns the same nodeId if the node has
 * a layout in the target perspective, otherwise returns null.
 */
export function findEquivalentNodeInPerspective(
	nodeId: string,
	graph: TerrainGraph,
	targetPerspectiveId: string,
): string | null {
	const node = graph.nodes.get(nodeId);
	if (!node) return null;

	const pos = node.layoutByPerspective[targetPerspectiveId];
	if (pos) return nodeId;

	return null;
}
