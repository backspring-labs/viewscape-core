import type { Edge } from "../entities/edge.js";
import type { Node } from "../entities/node.js";
import type { TerrainGraph } from "./graph.js";

type Direction = "in" | "out" | "both";

function getNeighborId(edge: Edge, nodeId: string, direction: Direction): string | undefined {
	if (direction !== "in" && edge.sourceNodeId === nodeId) {
		return edge.targetNodeId;
	}
	if (direction !== "out" && edge.targetNodeId === nodeId) {
		return edge.sourceNodeId;
	}
	return undefined;
}

function collectNeighborIds(
	graph: TerrainGraph,
	nodeId: string,
	direction: Direction,
	visited: ReadonlySet<string>,
): string[] {
	const neighbors: string[] = [];
	for (const edge of graph.edges.values()) {
		const neighborId = getNeighborId(edge, nodeId, direction);
		if (neighborId != null && !visited.has(neighborId)) {
			neighbors.push(neighborId);
		}
	}
	return neighbors;
}

/**
 * Breadth-first traversal from a starting node, returning all reachable nodes
 * up to an optional depth limit.
 */
export function bfsTraverse(
	graph: TerrainGraph,
	startNodeId: string,
	options: { maxDepth?: number; direction?: Direction } = {},
): Node[] {
	const { maxDepth, direction = "both" } = options;
	const visited = new Set<string>([startNodeId]);
	const result: Node[] = [];
	const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;

		const node = graph.nodes.get(current.nodeId);
		if (node) {
			result.push(node);
		}

		if (maxDepth != null && current.depth >= maxDepth) {
			continue;
		}

		for (const neighborId of collectNeighborIds(graph, current.nodeId, direction, visited)) {
			visited.add(neighborId);
			queue.push({ nodeId: neighborId, depth: current.depth + 1 });
		}
	}

	return result;
}
