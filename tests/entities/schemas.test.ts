import { describe, expect, it } from "vitest";
import {
	AnnotationSchema,
	CapabilitySchema,
	DomainSchema,
	EdgeSchema,
	EvidenceRefSchema,
	FocusTargetSchema,
	JourneySchema,
	LayerSchema,
	NodeSchema,
	PerspectiveSchema,
	ProcessSchema,
	ProcessStageSchema,
	ProviderAssociationSchema,
	ProviderSchema,
	SceneSchema,
	SessionSchema,
	SourceSchema,
	StepSchema,
	StoryRouteSchema,
	StoryWaypointSchema,
	TerrainIndexSchema,
	ValueStreamSchema,
	WorkspaceSchema,
} from "../../src/entities/index.js";
import { ProvenanceRefSchema } from "../../src/provenance/index.js";
import {
	annotations,
	capabilities,
	domains,
	edges,
	evidenceRefs,
	journeys,
	layers,
	nodes,
	perspectives,
	processStages,
	processes,
	providerAssociations,
	providers,
	scenes,
	steps,
	storyRoutes,
	storyWaypoints,
	valueStreams,
} from "../../src/test-fixtures/index.js";

describe("Entity schemas validate seed data", () => {
	it("validates all domains", () => {
		for (const d of domains) {
			const parsed = DomainSchema.parse(d);
			expect(parsed).toBeDefined();
			expect(parsed.id).toBe(d.id);
			expect(parsed.label).toBe(d.label);
		}
	});

	it("validates all capabilities", () => {
		for (const c of capabilities) {
			expect(CapabilitySchema.parse(c)).toBeDefined();
		}
	});

	it("validates all nodes", () => {
		for (const n of nodes) {
			expect(NodeSchema.parse(n)).toBeDefined();
		}
	});

	it("validates all edges", () => {
		for (const e of edges) {
			expect(EdgeSchema.parse(e)).toBeDefined();
		}
	});

	it("validates all steps", () => {
		for (const s of steps) {
			expect(StepSchema.parse(s)).toBeDefined();
		}
	});

	it("validates all journeys", () => {
		for (const j of journeys) {
			expect(JourneySchema.parse(j)).toBeDefined();
		}
	});

	it("validates all perspectives", () => {
		for (const p of perspectives) {
			expect(PerspectiveSchema.parse(p)).toBeDefined();
		}
	});

	it("validates all layers", () => {
		for (const l of layers) {
			expect(LayerSchema.parse(l)).toBeDefined();
		}
	});

	it("validates all scenes", () => {
		for (const s of scenes) {
			expect(SceneSchema.parse(s)).toBeDefined();
		}
	});

	it("validates all annotations", () => {
		for (const a of annotations) {
			expect(AnnotationSchema.parse(a)).toBeDefined();
		}
	});

	it("validates all evidence refs", () => {
		for (const e of evidenceRefs) {
			expect(EvidenceRefSchema.parse(e)).toBeDefined();
		}
	});
});

describe("Schema rejection", () => {
	it("rejects node missing required fields", () => {
		expect(() => NodeSchema.parse({ id: "x" })).toThrow();
		expect(() => NodeSchema.parse({})).toThrow();
	});

	it("rejects edge with wrong types", () => {
		expect(() => EdgeSchema.parse({ id: 123, sourceNodeId: true })).toThrow();
	});

	it("rejects domain missing label", () => {
		expect(() => DomainSchema.parse({ id: "d1" })).toThrow();
	});

	it("rejects step with invalid focus target type", () => {
		expect(() => FocusTargetSchema.parse({ type: "invalid_type", targetId: "x" })).toThrow();
	});

	it("rejects perspective with invalid type", () => {
		expect(() => PerspectiveSchema.parse({ id: "p1", type: "invalid", label: "Test" })).toThrow();
	});

	it("rejects annotation with invalid target type", () => {
		expect(() =>
			AnnotationSchema.parse({
				id: "a1",
				targetType: "invalid",
				targetId: "x",
				type: "research_note",
				content: "test",
				createdAt: "2026-01-01T00:00:00Z",
			}),
		).toThrow();
	});

	it("rejects terrain index with negative counts", () => {
		expect(() =>
			TerrainIndexSchema.parse({
				id: "idx-1",
				sourceId: "s-1",
				version: "1",
				builtAt: "2026-01-01T00:00:00Z",
				status: "ready",
				nodeCount: -1,
				edgeCount: 0,
			}),
		).toThrow();
	});
});

describe("Optional fields and defaults", () => {
	it("node defaults tags to empty array", () => {
		const node = NodeSchema.parse({ id: "n1", type: "service", label: "Test" });
		expect(node.tags).toEqual([]);
		expect(node.metadata).toEqual({});
		expect(node.layoutByPerspective).toEqual({});
	});

	it("edge defaults directed to true", () => {
		const edge = EdgeSchema.parse({
			id: "e1",
			sourceNodeId: "a",
			targetNodeId: "b",
			type: "dep",
		});
		expect(edge.directed).toBe(true);
	});

	it("capability defaults arrays to empty", () => {
		const cap = CapabilitySchema.parse({
			id: "c1",
			domainId: "d1",
			label: "Test",
		});
		expect(cap.nodeIds).toEqual([]);
		expect(cap.edgeIds).toEqual([]);
		expect(cap.journeyIds).toEqual([]);
	});

	it("session defaults nullable fields to null", () => {
		const session = SessionSchema.parse({
			id: "sess-1",
			workspaceId: "ws-1",
			activePerspectiveId: "persp-1",
		});
		expect(session.activeDomainId).toBeNull();
		expect(session.activeCapabilityId).toBeNull();
		expect(session.activeJourneyId).toBeNull();
		expect(session.activeStepId).toBeNull();
		expect(session.selectedNodeId).toBeNull();
		expect(session.selectedEdgeId).toBeNull();
		expect(session.viewportAnchor).toEqual({ x: 0, y: 0, zoom: 1 });
		expect(session.activeFocusTargets).toEqual([]);
	});

	it("provenance ref accepts optional fields", () => {
		const prov = ProvenanceRefSchema.parse({ sourceId: "s1" });
		expect(prov.confidence).toBe("high");
		expect(prov.sourceFile).toBeUndefined();
	});

	it("node accepts provenance", () => {
		const node = NodeSchema.parse({
			id: "n1",
			type: "service",
			label: "Test",
			provenance: { sourceId: "s1", confidence: "medium" },
		});
		expect(node.provenance?.confidence).toBe("medium");
	});

	it("workspace accepts valid datetime", () => {
		const ws = WorkspaceSchema.parse({
			id: "ws-1",
			name: "Test",
			createdAt: "2026-01-01T00:00:00Z",
		});
		expect(ws.sourceIds).toEqual([]);
	});

	it("source accepts valid types", () => {
		const s1 = SourceSchema.parse({
			id: "s1",
			type: "content_repo",
			uri: "/path/to/repo",
			label: "Test",
		});
		expect(s1.type).toBe("content_repo");

		const s2 = SourceSchema.parse({
			id: "s2",
			type: "code_repo",
			uri: "/path/to/code",
			label: "Code",
		});
		expect(s2.type).toBe("code_repo");
	});
});

describe("Domain → Capability → Journey hierarchy", () => {
	it("capabilities reference valid domains", () => {
		const domainIds = new Set(domains.map((d) => d.id));
		for (const cap of capabilities) {
			expect(domainIds.has(cap.domainId)).toBe(true);
		}
	});

	it("journeys reference valid capabilities", () => {
		const capIds = new Set(capabilities.map((c) => c.id));
		for (const journey of journeys) {
			expect(capIds.has(journey.entryCapabilityId)).toBe(true);
			for (const capId of journey.capabilityIds) {
				expect(capIds.has(capId)).toBe(true);
			}
		}
	});

	it("steps reference valid capabilities", () => {
		const capIds = new Set(capabilities.map((c) => c.id));
		for (const step of steps) {
			expect(capIds.has(step.capabilityId)).toBe(true);
		}
	});

	it("journey entry capability is in its capability list", () => {
		for (const journey of journeys) {
			expect(journey.capabilityIds).toContain(journey.entryCapabilityId);
		}
	});

	it("step focus target nodes exist in the node set", () => {
		const nodeIds = new Set(nodes.map((n) => n.id));
		const edgeIds = new Set(edges.map((e) => e.id));
		for (const step of steps) {
			for (const ft of step.focusTargets) {
				if (ft.type === "node") {
					expect(nodeIds.has(ft.targetId)).toBe(true);
				}
				if (ft.type === "edge") {
					expect(edgeIds.has(ft.targetId)).toBe(true);
				}
			}
		}
	});
});

describe("0.2.0 entity schemas validate seed data", () => {
	it("validates all providers", () => {
		expect(providers.length).toBe(5);
		for (const p of providers) {
			expect(ProviderSchema.parse(p)).toBeDefined();
		}
	});

	it("validates all provider associations", () => {
		expect(providerAssociations.length).toBeGreaterThanOrEqual(6);
		for (const pa of providerAssociations) {
			expect(ProviderAssociationSchema.parse(pa)).toBeDefined();
		}
	});

	it("validates all value streams", () => {
		expect(valueStreams.length).toBe(2);
		for (const vs of valueStreams) {
			expect(ValueStreamSchema.parse(vs)).toBeDefined();
		}
	});

	it("validates all processes", () => {
		expect(processes.length).toBe(1);
		for (const p of processes) {
			expect(ProcessSchema.parse(p)).toBeDefined();
		}
	});

	it("validates all process stages", () => {
		expect(processStages.length).toBe(4);
		for (const ps of processStages) {
			expect(ProcessStageSchema.parse(ps)).toBeDefined();
		}
	});

	it("validates all story routes", () => {
		expect(storyRoutes.length).toBe(1);
		for (const sr of storyRoutes) {
			expect(StoryRouteSchema.parse(sr)).toBeDefined();
		}
	});

	it("validates all story waypoints", () => {
		expect(storyWaypoints.length).toBe(5);
		for (const sw of storyWaypoints) {
			expect(StoryWaypointSchema.parse(sw)).toBeDefined();
		}
	});

	it("FocusTargetType accepts new values", () => {
		expect(() => FocusTargetSchema.parse({ type: "provider", targetId: "prov-1" })).not.toThrow();
		expect(() =>
			FocusTargetSchema.parse({ type: "process_stage", targetId: "ps-1" }),
		).not.toThrow();
		expect(() => FocusTargetSchema.parse({ type: "value_stream", targetId: "vs-1" })).not.toThrow();
	});

	it("FocusTargetType still accepts original values", () => {
		expect(() => FocusTargetSchema.parse({ type: "node", targetId: "n-1" })).not.toThrow();
		expect(() => FocusTargetSchema.parse({ type: "edge", targetId: "e-1" })).not.toThrow();
	});
});

describe("0.2.0 referential integrity", () => {
	it("provider associations reference valid providers", () => {
		const providerIds = new Set(providers.map((p) => p.id));
		for (const pa of providerAssociations) {
			expect(providerIds.has(pa.providerId)).toBe(true);
		}
	});

	it("value streams reference valid domains", () => {
		const domainIds = new Set(domains.map((d) => d.id));
		for (const vs of valueStreams) {
			expect(domainIds.has(vs.domainId)).toBe(true);
		}
	});

	it("value stream capabilityIds reference valid capabilities", () => {
		const capIds = new Set(capabilities.map((c) => c.id));
		for (const vs of valueStreams) {
			for (const capId of vs.capabilityIds) {
				expect(capIds.has(capId)).toBe(true);
			}
		}
	});

	it("process stageIds reference valid process stages", () => {
		const stageIds = new Set(processStages.map((ps) => ps.id));
		for (const proc of processes) {
			for (const stageId of proc.stageIds) {
				expect(stageIds.has(stageId)).toBe(true);
			}
		}
	});

	it("process stages reference valid processes", () => {
		const processIds = new Set(processes.map((p) => p.id));
		for (const ps of processStages) {
			expect(processIds.has(ps.processId)).toBe(true);
		}
	});

	it("story route waypointIds reference valid waypoints", () => {
		const waypointIds = new Set(storyWaypoints.map((sw) => sw.id));
		for (const sr of storyRoutes) {
			for (const wpId of sr.waypointIds) {
				expect(waypointIds.has(wpId)).toBe(true);
			}
		}
	});

	it("story waypoints reference valid story routes", () => {
		const routeIds = new Set(storyRoutes.map((sr) => sr.id));
		for (const sw of storyWaypoints) {
			expect(routeIds.has(sw.storyRouteId)).toBe(true);
		}
	});

	it("process references valid capabilities", () => {
		const capIds = new Set(capabilities.map((c) => c.id));
		for (const proc of processes) {
			for (const capId of proc.capabilityIds) {
				expect(capIds.has(capId)).toBe(true);
			}
		}
	});
});
