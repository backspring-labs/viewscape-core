import type { Annotation } from "../entities/annotation.js";
import type { Capability } from "../entities/capability.js";
import type { Domain } from "../entities/domain.js";
import type { Edge } from "../entities/edge.js";
import type { EvidenceRef } from "../entities/evidence-ref.js";
import type { Journey } from "../entities/journey.js";
import type { Layer } from "../entities/layer.js";
import type { Node } from "../entities/node.js";
import type { Perspective } from "../entities/perspective.js";
import type { ProcessStage } from "../entities/process-stage.js";
import type { Process } from "../entities/process.js";
import type { ProviderAssociation } from "../entities/provider-association.js";
import type { Provider } from "../entities/provider.js";
import type { Scene } from "../entities/scene.js";
import type { Step } from "../entities/step.js";
import type { StoryRoute } from "../entities/story-route.js";
import type { StoryWaypoint } from "../entities/story-waypoint.js";
import type { ValueStream } from "../entities/value-stream.js";

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

export function makeProvider(overrides: Partial<Provider> = {}): Provider {
	return {
		id: nextId("prov"),
		label: "Test Provider",
		category: "specialist",
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeProviderAssociation(
	overrides: Partial<ProviderAssociation> = {},
): ProviderAssociation {
	return {
		id: nextId("pa"),
		providerId: "prov-test",
		targetType: "capability",
		targetId: "cap-test",
		role: "participant",
		metadata: {},
		...overrides,
	};
}

export function makeValueStream(overrides: Partial<ValueStream> = {}): ValueStream {
	return {
		id: nextId("vs"),
		domainId: "dom-test",
		label: "Test Value Stream",
		capabilityIds: [],
		journeyIds: [],
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeProcess(overrides: Partial<Process> = {}): Process {
	return {
		id: nextId("proc"),
		label: "Test Process",
		capabilityIds: [],
		stageIds: [],
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeProcessStage(overrides: Partial<ProcessStage> = {}): ProcessStage {
	return {
		id: nextId("ps"),
		processId: "proc-test",
		sequenceNumber: 0,
		label: "Test Stage",
		nodeIds: [],
		edgeIds: [],
		controlPoints: [],
		metadata: {},
		...overrides,
	};
}

export function makeStoryRoute(overrides: Partial<StoryRoute> = {}): StoryRoute {
	return {
		id: nextId("sr"),
		title: "Test Story Route",
		destinationObjective: "Test objective",
		overview: "Test overview",
		waypointIds: [],
		tags: [],
		metadata: {},
		...overrides,
	};
}

export function makeStoryWaypoint(overrides: Partial<StoryWaypoint> = {}): StoryWaypoint {
	return {
		id: nextId("sw"),
		storyRouteId: "sr-test",
		sequenceNumber: 0,
		title: "Test Waypoint",
		keyMessage: "Test message",
		focusTargets: [],
		evidenceRefIds: [],
		metadata: {},
		...overrides,
	};
}
