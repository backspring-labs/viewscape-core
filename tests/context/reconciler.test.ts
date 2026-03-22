import { describe, expect, it } from "vitest";
import { createInitialNavigationContext } from "../../src/context/navigation-context.js";
import {
	reconcileCapabilitySwitch,
	reconcileDomainSwitch,
	reconcileJourneyDeselection,
	reconcileJourneySelection,
	reconcileModeSwitch,
	reconcileNodeSelection,
	reconcilePerspectiveSwitch,
	reconcileProcessSwitch,
	reconcileRouteEnd,
	reconcileRoutePause,
	reconcileRouteResume,
	reconcileStepChange,
	reconcileStoryRouteStart,
	reconcileValueStreamSwitch,
	reconcileWaypointChange,
} from "../../src/context/reconciler.js";
import { createGraph } from "../../src/graph/graph.js";
import {
	capabilities,
	edges,
	journeys,
	nodes,
	processStages,
	steps,
	storyRoutes,
	storyWaypoints,
	valueStreams,
} from "../../src/test-fixtures/index.js";

const graph = createGraph(nodes, edges);
// biome-ignore lint/style/noNonNullAssertion: seed data is known to have at least one journey
const journey = journeys[0]!;
const journeySteps = steps.filter((s) => s.journeyId === journey.id);

function baseCtx() {
	return createInitialNavigationContext("persp-overview");
}

describe("reconcileDomainSwitch", () => {
	it("sets domain and clears capability/journey/step", () => {
		const ctx = {
			...baseCtx(),
			activeCapabilityId: "cap-onboarding",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 3,
		};
		const result = reconcileDomainSwitch(ctx, "dom-accounts");
		expect(result.activeDomainId).toBe("dom-accounts");
		expect(result.activeCapabilityId).toBeNull();
		expect(result.activeJourneyId).toBeNull();
		expect(result.activeStepIndex).toBeNull();
		expect(result.activeFocusTargets).toEqual([]);
		expect(result.activeSceneId).toBeNull();
	});

	it("preserves perspective", () => {
		const ctx = { ...baseCtx(), activePerspectiveId: "persp-architecture" };
		const result = reconcileDomainSwitch(ctx, "dom-payments");
		expect(result.activePerspectiveId).toBe("persp-architecture");
	});

	it("preserves mode", () => {
		const ctx = { ...baseCtx(), mode: "guiderail" as const };
		const result = reconcileDomainSwitch(ctx, "dom-accounts");
		expect(result.mode).toBe("guiderail");
	});
});

describe("reconcileCapabilitySwitch", () => {
	it("sets capability and clears journey/step", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-accounts",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 2,
		};
		const result = reconcileCapabilitySwitch(ctx, "cap-account-opening");
		expect(result.activeCapabilityId).toBe("cap-account-opening");
		expect(result.activeJourneyId).toBeNull();
		expect(result.activeStepIndex).toBeNull();
	});

	it("preserves domain and perspective", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-accounts",
			activePerspectiveId: "persp-process",
		};
		const result = reconcileCapabilitySwitch(ctx, "cap-account-opening");
		expect(result.activeDomainId).toBe("dom-accounts");
		expect(result.activePerspectiveId).toBe("persp-process");
	});
});

describe("reconcilePerspectiveSwitch", () => {
	it("preserves domain/capability/journey/step", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-accounts",
			activeCapabilityId: "cap-account-opening",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 2,
			activeFocusTargets: [{ type: "node" as const, targetId: "n-identity-svc" }],
		};
		const result = reconcilePerspectiveSwitch(ctx, "persp-architecture", graph);
		expect(result.activeDomainId).toBe("dom-accounts");
		expect(result.activeCapabilityId).toBe("cap-account-opening");
		expect(result.activeJourneyId).toBe("j-open-savings");
		expect(result.activeStepIndex).toBe(2);
		expect(result.activePerspectiveId).toBe("persp-architecture");
	});

	it("updates viewport to focal node position in new perspective", () => {
		const ctx = {
			...baseCtx(),
			activeFocusTargets: [{ type: "node" as const, targetId: "n-identity-svc" }],
		};
		const result = reconcilePerspectiveSwitch(ctx, "persp-architecture", graph);
		// n-identity-svc has persp-architecture layout at { x: 950, y: 0 }
		expect(result.viewportAnchor.x).toBe(950);
		expect(result.viewportAnchor.y).toBe(0);
	});

	it("uses selectedNodeId if no focus targets", () => {
		const ctx = {
			...baseCtx(),
			selectedNodeId: "n-core-ledger",
		};
		const result = reconcilePerspectiveSwitch(ctx, "persp-architecture", graph);
		// n-core-ledger has persp-architecture layout at { x: 1300, y: 250 }
		expect(result.viewportAnchor.x).toBe(1300);
		expect(result.viewportAnchor.y).toBe(250);
	});
});

describe("reconcileJourneySelection", () => {
	it("sets journey, step 0, and focus targets", () => {
		const result = reconcileJourneySelection(baseCtx(), journey, journeySteps, capabilities, graph);
		expect(result.activeJourneyId).toBe("j-open-savings");
		expect(result.activeStepIndex).toBe(0);
		expect(result.activeFocusTargets.length).toBeGreaterThan(0);
		expect(result.activeSceneId).toBe("sc-1");
	});

	it("infers domain from entry capability when not set", () => {
		const result = reconcileJourneySelection(baseCtx(), journey, journeySteps, capabilities, graph);
		expect(result.activeDomainId).toBe("dom-customer");
		expect(result.activeCapabilityId).toBe("cap-onboarding");
	});

	it("preserves existing domain/capability if already set", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-accounts",
			activeCapabilityId: "cap-account-opening",
		};
		const result = reconcileJourneySelection(ctx, journey, journeySteps, capabilities, graph);
		expect(result.activeDomainId).toBe("dom-accounts");
		expect(result.activeCapabilityId).toBe("cap-account-opening");
	});

	it("preserves perspective", () => {
		const ctx = { ...baseCtx(), activePerspectiveId: "persp-provider" };
		const result = reconcileJourneySelection(ctx, journey, journeySteps, capabilities, graph);
		expect(result.activePerspectiveId).toBe("persp-provider");
	});

	it("updates viewport to first step's primary node", () => {
		const result = reconcileJourneySelection(baseCtx(), journey, journeySteps, capabilities, graph);
		// First step focuses on n-customer, which has persp-overview layout at { x: 0, y: 200 }
		expect(result.viewportAnchor.x).toBe(0);
		expect(result.viewportAnchor.y).toBe(200);
	});
});

describe("reconcileJourneyDeselection", () => {
	it("clears journey/step/scene but preserves domain/capability/perspective", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-customer",
			activeCapabilityId: "cap-onboarding",
			activePerspectiveId: "persp-process",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 3,
			activeSceneId: "sc-4",
			selectedNodeId: "n-risk-svc",
		};
		const result = reconcileJourneyDeselection(ctx);
		expect(result.activeJourneyId).toBeNull();
		expect(result.activeStepIndex).toBeNull();
		expect(result.activeSceneId).toBeNull();
		expect(result.activeFocusTargets).toEqual([]);
		expect(result.activeDomainId).toBe("dom-customer");
		expect(result.activeCapabilityId).toBe("cap-onboarding");
		expect(result.activePerspectiveId).toBe("persp-process");
		expect(result.selectedNodeId).toBe("n-risk-svc");
	});
});

describe("reconcileStepChange", () => {
	it("updates focus targets, scene, and viewport", () => {
		const ctx = {
			...baseCtx(),
			activeJourneyId: "j-open-savings",
			activeStepIndex: 0,
		};
		const result = reconcileStepChange(ctx, 2, journeySteps, graph);
		expect(result.activeStepIndex).toBe(2);
		expect(result.activeFocusTargets.length).toBeGreaterThan(0);
		expect(result.activeSceneId).toBe("sc-3");
	});

	it("updates capability when step crosses capability boundary", () => {
		const ctx = {
			...baseCtx(),
			activeCapabilityId: "cap-onboarding",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 3,
		};
		// Step 4 (index 4) is in cap-account-opening
		const result = reconcileStepChange(ctx, 4, journeySteps, graph);
		expect(result.activeCapabilityId).toBe("cap-account-opening");
	});

	it("updates viewport to primary node position", () => {
		const ctx = {
			...baseCtx(),
			activeJourneyId: "j-open-savings",
			activeStepIndex: 0,
		};
		// Step 2 focuses on n-identity-svc (persp-overview: { x: 950, y: 0 })
		const result = reconcileStepChange(ctx, 2, journeySteps, graph);
		expect(result.viewportAnchor.x).toBe(950);
		expect(result.viewportAnchor.y).toBe(0);
	});

	it("returns unchanged context for invalid step index", () => {
		const ctx = { ...baseCtx(), activeStepIndex: 0 };
		const result = reconcileStepChange(ctx, 99, journeySteps, graph);
		expect(result).toEqual(ctx);
	});
});

describe("reconcileNodeSelection", () => {
	it("snaps to step when node is on active journey path", () => {
		const ctx = {
			...baseCtx(),
			activeJourneyId: "j-open-savings",
			activeStepIndex: 0,
		};
		// n-identity-svc is on step 2 (sequenceNumber 2)
		const result = reconcileNodeSelection(ctx, "n-identity-svc", journeySteps, graph);
		expect(result.activeStepIndex).toBe(2);
		expect(result.activeSceneId).toBe("sc-3");
	});

	it("selects node without disrupting journey when node is off-path", () => {
		const ctx = {
			...baseCtx(),
			activeJourneyId: "j-open-savings",
			activeStepIndex: 2,
			activeSceneId: "sc-3",
		};
		// n-payment-orch is not on the account-opening journey path
		const result = reconcileNodeSelection(ctx, "n-payment-orch", journeySteps, graph);
		expect(result.selectedNodeId).toBe("n-payment-orch");
		expect(result.activeStepIndex).toBe(2);
		expect(result.activeSceneId).toBe("sc-3");
		expect(result.activeJourneyId).toBe("j-open-savings");
	});

	it("selects node normally when no journey is active", () => {
		const result = reconcileNodeSelection(baseCtx(), "n-core-ledger", [], graph);
		expect(result.selectedNodeId).toBe("n-core-ledger");
		expect(result.activeJourneyId).toBeNull();
	});
});

describe("reconcileModeSwitch", () => {
	it("switches mode and preserves all context", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-accounts",
			activeCapabilityId: "cap-account-opening",
			activeJourneyId: "j-open-savings",
			activeStepIndex: 3,
		};
		const result = reconcileModeSwitch(ctx, "guiderail");
		expect(result.mode).toBe("guiderail");
		expect(result.activeDomainId).toBe("dom-accounts");
		expect(result.activeCapabilityId).toBe("cap-account-opening");
		expect(result.activeJourneyId).toBe("j-open-savings");
		expect(result.activeStepIndex).toBe(3);
	});
});

// --- 0.2.0 reconciler additions ---

// biome-ignore lint/style/noNonNullAssertion: seed data known
const retailPayments = valueStreams.find((vs) => vs.id === "vs-retail-payments")!;
// biome-ignore lint/style/noNonNullAssertion: seed data known
const paymentAuthProcess = storyRoutes.find((sr) => sr.id === "sr-payment-flow")!;
const paymentAuthStages = processStages.filter((ps) => ps.processId === "proc-payment-auth");
const routeWaypoints = storyWaypoints.filter((sw) => sw.storyRouteId === "sr-payment-flow");
// biome-ignore lint/style/noNonNullAssertion: seed data known
const storyRoute = storyRoutes.find((sr) => sr.id === "sr-payment-flow")!;

describe("reconcileValueStreamSwitch", () => {
	it("sets value stream and clears process", () => {
		const ctx = { ...baseCtx(), activeDomainId: "dom-payments", activeProcessId: "proc-1" };
		const result = reconcileValueStreamSwitch(ctx, "vs-retail-payments", retailPayments);
		expect(result.activeValueStreamId).toBe("vs-retail-payments");
		expect(result.activeProcessId).toBeNull();
	});

	it("preserves capability if it belongs to the value stream", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activeCapabilityId: "cap-money-movement",
		};
		const result = reconcileValueStreamSwitch(ctx, "vs-retail-payments", retailPayments);
		expect(result.activeCapabilityId).toBe("cap-money-movement");
	});

	it("clears capability if it does not belong to the value stream", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activeCapabilityId: "cap-auth",
		};
		const result = reconcileValueStreamSwitch(ctx, "vs-retail-payments", retailPayments);
		expect(result.activeCapabilityId).toBeNull();
	});

	it("preserves domain and perspective", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activePerspectiveId: "persp-provider",
		};
		const result = reconcileValueStreamSwitch(ctx, "vs-retail-payments", retailPayments);
		expect(result.activeDomainId).toBe("dom-payments");
		expect(result.activePerspectiveId).toBe("persp-provider");
	});
});

describe("reconcileProcessSwitch", () => {
	it("sets process and updates focus to first stage nodes", () => {
		const result = reconcileProcessSwitch(baseCtx(), "proc-payment-auth", paymentAuthStages, graph);
		expect(result.activeProcessId).toBe("proc-payment-auth");
		expect(result.activeFocusTargets.length).toBeGreaterThan(0);
		expect(result.activeFocusTargets[0]?.type).toBe("node");
	});

	it("preserves domain/capability/perspective", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activeCapabilityId: "cap-payment-processing",
			activePerspectiveId: "persp-process",
		};
		const result = reconcileProcessSwitch(ctx, "proc-payment-auth", paymentAuthStages, graph);
		expect(result.activeDomainId).toBe("dom-payments");
		expect(result.activeCapabilityId).toBe("cap-payment-processing");
		expect(result.activePerspectiveId).toBe("persp-process");
	});
});

describe("reconcileStoryRouteStart", () => {
	it("sets route, first waypoint, and routeState active", () => {
		const result = reconcileStoryRouteStart(baseCtx(), storyRoute, routeWaypoints, graph);
		expect(result.activeStoryRouteId).toBe("sr-payment-flow");
		expect(result.activeWaypointIndex).toBe(0);
		expect(result.routeState).toBe("active");
		expect(result.activeFocusTargets.length).toBeGreaterThan(0);
	});

	it("applies first waypoint perspective if present", () => {
		const result = reconcileStoryRouteStart(baseCtx(), storyRoute, routeWaypoints, graph);
		// First waypoint (sw-1) has perspectiveId: "persp-overview"
		expect(result.activePerspectiveId).toBe("persp-overview");
	});

	it("does not clear domain/capability", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activeCapabilityId: "cap-payment-processing",
		};
		const result = reconcileStoryRouteStart(ctx, storyRoute, routeWaypoints, graph);
		expect(result.activeDomainId).toBe("dom-payments");
		expect(result.activeCapabilityId).toBe("cap-payment-processing");
	});
});

describe("reconcileWaypointChange", () => {
	it("updates focus targets for new waypoint", () => {
		const ctx = {
			...baseCtx(),
			activeStoryRouteId: "sr-payment-flow",
			activeWaypointIndex: 0,
			routeState: "active" as const,
		};
		const result = reconcileWaypointChange(ctx, 1, routeWaypoints, graph);
		expect(result.activeWaypointIndex).toBe(1);
		expect(result.activeFocusTargets.length).toBeGreaterThan(0);
	});

	it("applies waypoint perspective if present", () => {
		const ctx = { ...baseCtx(), routeState: "active" as const };
		// Waypoint sw-2 (index 1) has perspectiveId: "persp-architecture"
		const result = reconcileWaypointChange(ctx, 1, routeWaypoints, graph);
		expect(result.activePerspectiveId).toBe("persp-architecture");
	});

	it("preserves current perspective if waypoint has no perspectiveId", () => {
		const ctx = {
			...baseCtx(),
			activePerspectiveId: "persp-provider",
			routeState: "active" as const,
		};
		// Waypoint sw-5 (index 4) has no perspectiveId
		const result = reconcileWaypointChange(ctx, 4, routeWaypoints, graph);
		expect(result.activePerspectiveId).toBe("persp-provider");
	});

	it("returns unchanged for invalid waypoint index", () => {
		const ctx = { ...baseCtx(), routeState: "active" as const };
		const result = reconcileWaypointChange(ctx, 99, routeWaypoints, graph);
		expect(result).toEqual(ctx);
	});
});

describe("reconcileRoutePause", () => {
	it("sets routeState to paused", () => {
		const ctx = {
			...baseCtx(),
			activeStoryRouteId: "sr-payment-flow",
			activeWaypointIndex: 2,
			routeState: "active" as const,
		};
		const result = reconcileRoutePause(ctx);
		expect(result.routeState).toBe("paused");
		expect(result.activeStoryRouteId).toBe("sr-payment-flow");
		expect(result.activeWaypointIndex).toBe(2);
	});
});

describe("reconcileRouteResume", () => {
	it("restores focus/perspective/viewport from saved snapshot", () => {
		const savedSnapshot = {
			...baseCtx(),
			activeFocusTargets: [{ type: "node" as const, targetId: "n-risk-svc" }],
			activePerspectiveId: "persp-architecture",
			viewportAnchor: { x: 500, y: 200, zoom: 1.5 },
			activeWaypointIndex: 2,
		};
		const currentCtx = {
			...baseCtx(),
			routeState: "paused" as const,
			activeStoryRouteId: "sr-payment-flow",
			selectedNodeId: "n-customer",
			activePerspectiveId: "persp-overview",
		};
		const result = reconcileRouteResume(currentCtx, savedSnapshot);
		expect(result.routeState).toBe("active");
		expect(result.activeFocusTargets).toEqual(savedSnapshot.activeFocusTargets);
		expect(result.activePerspectiveId).toBe("persp-architecture");
		expect(result.viewportAnchor).toEqual(savedSnapshot.viewportAnchor);
		expect(result.activeWaypointIndex).toBe(2);
	});
});

describe("reconcileRouteEnd", () => {
	it("clears route state and preserves domain/capability/perspective", () => {
		const ctx = {
			...baseCtx(),
			activeDomainId: "dom-payments",
			activeCapabilityId: "cap-payment-processing",
			activePerspectiveId: "persp-architecture",
			activeStoryRouteId: "sr-payment-flow",
			activeWaypointIndex: 4,
			routeState: "active" as const,
			activeFocusTargets: [{ type: "node" as const, targetId: "n-core-ledger" }],
		};
		const result = reconcileRouteEnd(ctx);
		expect(result.activeStoryRouteId).toBeNull();
		expect(result.activeWaypointIndex).toBeNull();
		expect(result.routeState).toBe("inactive");
		expect(result.activeFocusTargets).toEqual([]);
		expect(result.activeDomainId).toBe("dom-payments");
		expect(result.activeCapabilityId).toBe("cap-payment-processing");
		expect(result.activePerspectiveId).toBe("persp-architecture");
	});
});
