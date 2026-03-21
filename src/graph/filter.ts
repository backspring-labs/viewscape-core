import type { Edge } from "../entities/edge.js";
import type { Node } from "../entities/node.js";
import type { TerrainGraph } from "./graph.js";

/**
 * Return a filtered view of the graph containing only nodes matching the predicate
 * and edges where both endpoints are in the filtered set.
 */
export function filterGraph(
	graph: TerrainGraph,
	nodePredicate: (n: Node) => boolean,
): TerrainGraph {
	const filteredNodes = new Map<string, Node>();
	for (const [id, node] of graph.nodes) {
		if (nodePredicate(node)) {
			filteredNodes.set(id, node);
		}
	}

	const filteredEdges = new Map<string, Edge>();
	for (const [id, edge] of graph.edges) {
		if (filteredNodes.has(edge.sourceNodeId) && filteredNodes.has(edge.targetNodeId)) {
			filteredEdges.set(id, edge);
		}
	}

	return { nodes: filteredNodes, edges: filteredEdges };
}

/**
 * Filter nodes by tags — returns nodes that have at least one of the given tags.
 */
export function filterNodesByTags(graph: TerrainGraph, tags: string[]): Node[] {
	const tagSet = new Set(tags);
	const result: Node[] = [];
	for (const node of graph.nodes.values()) {
		if (node.tags.some((t) => tagSet.has(t))) {
			result.push(node);
		}
	}
	return result;
}

/**
 * Filter nodes by type.
 */
export function filterNodesByType(graph: TerrainGraph, types: string[]): Node[] {
	const typeSet = new Set(types);
	const result: Node[] = [];
	for (const node of graph.nodes.values()) {
		if (typeSet.has(node.type)) {
			result.push(node);
		}
	}
	return result;
}
