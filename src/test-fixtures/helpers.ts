import type { Annotation } from "../entities/annotation.js";
import type { Capability } from "../entities/capability.js";
import type { Domain } from "../entities/domain.js";
import type { Edge } from "../entities/edge.js";
import type { EvidenceRef } from "../entities/evidence-ref.js";
import type { Journey } from "../entities/journey.js";
import type { Layer } from "../entities/layer.js";
import type { Node } from "../entities/node.js";
import type { Perspective } from "../entities/perspective.js";
import type { Scene } from "../entities/scene.js";
import type { Step } from "../entities/step.js";

let counter = 0;
function nextId(prefix: string): string {
	counter++;
	return `${prefix}-${counter}`;
}

export function resetIdCounter(): void {
	counter = 0;
}

export function makeDomain(overrides: Partial<Domain> = {}): Domain {
	return {
		id: nextId("dom"),
		label: "Test Domain",
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeCapability(overrides: Partial<Capability> = {}): Capability {
	return {
		id: nextId("cap"),
		domainId: "dom-test",
		label: "Test Capability",
		nodeIds: [],
		edgeIds: [],
		journeyIds: [],
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeNode(overrides: Partial<Node> = {}): Node {
	return {
		id: nextId("node"),
		type: "service",
		label: "Test Node",
		tags: [],
		metadata: {},
		layoutByPerspective: {},
		...overrides,
	};
}

export function makeEdge(overrides: Partial<Edge> = {}): Edge {
	return {
		id: nextId("edge"),
		sourceNodeId: "node-source",
		targetNodeId: "node-target",
		type: "dependency",
		directed: true,
		metadata: {},
		...overrides,
	};
}

export function makeJourney(overrides: Partial<Journey> = {}): Journey {
	return {
		id: nextId("journey"),
		label: "Test Journey",
		entryCapabilityId: "cap-test",
		capabilityIds: [],
		stepIds: [],
		tags: [],
		entryConditions: [],
		exitConditions: [],
		metadata: {},
		...overrides,
	};
}

export function makeStep(overrides: Partial<Step> = {}): Step {
	return {
		id: nextId("step"),
		journeyId: "journey-test",
		sequenceNumber: 0,
		focusTargets: [],
		capabilityId: "cap-test",
		title: "Test Step",
		nextStepIds: [],
		evidenceRefIds: [],
		metadata: {},
		...overrides,
	};
}

export function makePerspective(overrides: Partial<Perspective> = {}): Perspective {
	return {
		id: nextId("persp"),
		type: "overview",
		label: "Test Perspective",
		highlightRules: {},
		visibilityRules: {},
		...overrides,
	};
}

export function makeLayer(overrides: Partial<Layer> = {}): Layer {
	return {
		id: nextId("layer"),
		label: "Test Layer",
		eligibleNodeTypes: [],
		eligibleEdgeTypes: [],
		layoutStrategy: "auto",
		renderingHints: {},
		metadata: {},
		...overrides,
	};
}

export function makeScene(overrides: Partial<Scene> = {}): Scene {
	return {
		id: nextId("scene"),
		stepId: "step-test",
		focusTargets: [],
		annotations: [],
		...overrides,
	};
}

export function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
	return {
		id: nextId("ann"),
		targetType: "node",
		targetId: "node-test",
		type: "research_note",
		content: "Test annotation",
		createdAt: "2026-01-01T00:00:00Z",
		...overrides,
	};
}

export function makeEvidenceRef(overrides: Partial<EvidenceRef> = {}): EvidenceRef {
	return {
		id: nextId("ev"),
		title: "Test Evidence",
		type: "document",
		accessClassification: "internal",
		relatedEntityIds: [],
		...overrides,
	};
}
