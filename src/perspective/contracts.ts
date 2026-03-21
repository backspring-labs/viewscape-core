import type { NavigationContext } from "../context/navigation-context.js";
import type { Edge } from "../entities/edge.js";
import type { Layer } from "../entities/layer.js";
import type { Node } from "../entities/node.js";
import type { Perspective } from "../entities/perspective.js";
import type { TerrainGraph } from "../graph/graph.js";

export interface ProjectedNode {
	id: string;
	node: Node;
	position: { x: number; y: number };
	visible: boolean;
	highlighted: boolean;
	selected: boolean;
}

export interface ProjectedEdge {
	id: string;
	edge: Edge;
	visible: boolean;
	highlighted: boolean;
}

export interface PerspectiveView {
	nodes: ProjectedNode[];
	edges: ProjectedEdge[];
	highlightedPath: string[];
	focusNodeId: string | null;
	activeCapabilityBoundary: string | null;
}

/**
 * Contract for perspective providers. Consumers implement this to project
 * the canonical graph into a renderable view for a given perspective.
 */
export interface PerspectiveProvider {
	project(
		context: NavigationContext,
		graph: TerrainGraph,
		perspective: Perspective,
		layer: Layer,
	): PerspectiveView;
}
