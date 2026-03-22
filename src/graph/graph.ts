import type { Capability } from "../entities/capability.js";
import type { Edge } from "../entities/edge.js";
import type { Journey } from "../entities/journey.js";
import type { Layer } from "../entities/layer.js";
import type { Node } from "../entities/node.js";
import type { Process } from "../entities/process.js";
import type { ProviderAssociation } from "../entities/provider-association.js";
import type { Step } from "../entities/step.js";
import type { ValueStream } from "../entities/value-stream.js";

export interface TerrainGraph {
	readonly nodes: ReadonlyMap<string, Node>;
	readonly edges: ReadonlyMap<string, Edge>;
}

export function createGraph(nodes: Node[], edges: Edge[]): TerrainGraph {
	const nodeMap = new Map<string, Node>();
	for (const node of nodes) {
		nodeMap.set(node.id, node);
	}

	const edgeMap = new Map<string, Edge>();
	for (const edge of edges) {
		edgeMap.set(edge.id, edge);
	}

	return { nodes: nodeMap, edges: edgeMap };
}

export function getNode(graph: TerrainGraph, id: string): Node | undefined {
	return graph.nodes.get(id);
}

export function getEdge(graph: TerrainGraph, id: string): Edge | undefined {
	return graph.edges.get(id);
}

export function getNeighbors(
	graph: TerrainGraph,
	nodeId: string,
	direction: "in" | "out" | "both" = "both",
): Node[] {
	const neighbors: Node[] = [];
	const seen = new Set<string>();

	for (const edge of graph.edges.values()) {
		let neighborId: string | undefined;

		if (direction !== "in" && edge.sourceNodeId === nodeId) {
			neighborId = edge.targetNodeId;
		}
		if (direction !== "out" && edge.targetNodeId === nodeId) {
			neighborId = edge.sourceNodeId;
		}

		if (neighborId != null && !seen.has(neighborId)) {
			seen.add(neighborId);
			const neighbor = graph.nodes.get(neighborId);
			if (neighbor) {
				neighbors.push(neighbor);
			}
		}
	}

	return neighbors;
}

export function getEdgesForNode(
	graph: TerrainGraph,
	nodeId: string,
	direction: "in" | "out" | "both" = "both",
): Edge[] {
	const result: Edge[] = [];

	for (const edge of graph.edges.values()) {
		if (direction !== "in" && edge.sourceNodeId === nodeId) {
			result.push(edge);
		} else if (direction !== "out" && edge.targetNodeId === nodeId) {
			result.push(edge);
		}
	}

	return result;
}

export function filterNodes(graph: TerrainGraph, predicate: (n: Node) => boolean): Node[] {
	const result: Node[] = [];
	for (const node of graph.nodes.values()) {
		if (predicate(node)) {
			result.push(node);
		}
	}
	return result;
}

export function getNodesForCapability(graph: TerrainGraph, capability: Capability): Node[] {
	const result: Node[] = [];
	for (const nodeId of capability.nodeIds) {
		const node = graph.nodes.get(nodeId);
		if (node) {
			result.push(node);
		}
	}
	return result;
}

export function getCapabilitiesForDomain(
	domainId: string,
	capabilities: Capability[],
): Capability[] {
	return capabilities.filter((c) => c.domainId === domainId);
}

export function getNodesForLayer(graph: TerrainGraph, layer: Layer): Node[] {
	if (layer.eligibleNodeTypes.length === 0) {
		return [...graph.nodes.values()];
	}
	const eligible = new Set(layer.eligibleNodeTypes);
	return filterNodes(graph, (n) => eligible.has(n.type));
}

export function getPathNodes(graph: TerrainGraph, journey: Journey, steps: Step[]): Node[] {
	const orderedSteps = [...steps].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
	const result: Node[] = [];
	const seen = new Set<string>();

	for (const step of orderedSteps) {
		for (const ft of step.focusTargets) {
			if (ft.type === "node" && !seen.has(ft.targetId)) {
				seen.add(ft.targetId);
				const node = graph.nodes.get(ft.targetId);
				if (node) {
					result.push(node);
				}
			}
		}
	}

	return result;
}

export function getProvidersForCapability(
	capabilityId: string,
	associations: ProviderAssociation[],
): string[] {
	return [
		...new Set(
			associations
				.filter((a) => a.targetType === "capability" && a.targetId === capabilityId)
				.map((a) => a.providerId),
		),
	];
}

export function getProvidersForValueStream(
	valueStreamId: string,
	associations: ProviderAssociation[],
): string[] {
	return [
		...new Set(
			associations
				.filter((a) => a.targetType === "value_stream" && a.targetId === valueStreamId)
				.map((a) => a.providerId),
		),
	];
}

export function getValueStreamsForDomain(
	domainId: string,
	valueStreams: ValueStream[],
): ValueStream[] {
	return valueStreams.filter((vs) => vs.domainId === domainId);
}

export function getProcessesForCapability(capabilityId: string, processes: Process[]): Process[] {
	return processes.filter((p) => p.capabilityIds.includes(capabilityId));
}
