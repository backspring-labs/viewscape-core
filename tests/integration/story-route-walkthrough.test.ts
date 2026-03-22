import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { contextMachine } from "../../src/context/context.machine.js";
import { createGraph } from "../../src/graph/graph.js";
import {
	capabilities,
	edges,
	journeys,
	nodes,
	processStages,
	processes,
	providerAssociations,
	providers,
	steps,
	storyRoutes,
	storyWaypoints,
	valueStreams,
} from "../../src/test-fixtures/index.js";

const graph = createGraph(nodes, edges);

function createFullContext() {
	const actor = createActor(contextMachine).start();
	actor.send({
		type: "INITIALIZE",
		graph,
		journeys,
		steps,
		capabilities,
		providers,
		providerAssociations,
		valueStreams,
		processes,
		processStages,
		storyRoutes,
		storyWaypoints,
	});
	return actor;
}

function nav(actor: ReturnType<typeof createActor<typeof contextMachine>>) {
	return actor.getSnapshot().context.nav;
}

describe("Story Route Walkthrough — full lifecycle with pause/return", () => {
	it("completes the full route lifecycle", () => {
		const actor = createFullContext();
		expect(actor.getSnapshot().value).toBe("ready");

		// 1. Set domain context before starting route
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-payment-processing" });
		expect(nav(actor).activeDomainId).toBe("dom-payments");
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");

		// 2. START_ROUTE "How a Payment Flows"
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		expect(nav(actor).activeStoryRouteId).toBe("sr-payment-flow");
		expect(nav(actor).activeWaypointIndex).toBe(0);
		expect(nav(actor).routeState).toBe("active");
		expect(nav(actor).activeFocusTargets.length).toBeGreaterThan(0);
		// Route does NOT clear domain/capability
		expect(nav(actor).activeDomainId).toBe("dom-payments");
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");

		// 3. First waypoint applies its perspective (persp-overview)
		expect(nav(actor).activePerspectiveId).toBe("persp-overview");

		// 4. NEXT_WAYPOINT — advance to waypoint 1
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(nav(actor).activeWaypointIndex).toBe(1);
		expect(nav(actor).activeFocusTargets.length).toBeGreaterThan(0);
		// Waypoint 1 has perspectiveId: "persp-architecture"
		expect(nav(actor).activePerspectiveId).toBe("persp-architecture");

		// 5. NEXT_WAYPOINT — advance to waypoint 2
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(nav(actor).activeWaypointIndex).toBe(2);
		// Waypoint 2 has no perspectiveId — should preserve "persp-architecture"
		expect(nav(actor).activePerspectiveId).toBe("persp-architecture");

		// 6. PAUSE_ROUTE mid-route
		actor.send({ type: "PAUSE_ROUTE" });
		expect(nav(actor).routeState).toBe("paused");
		expect(nav(actor).activeWaypointIndex).toBe(2);
		expect(actor.getSnapshot().context.pausedRouteSnapshot).not.toBeNull();

		// 7. Freely explore during pause
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_NODE", nodeId: "n-customer" });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-overview" });
		// Temporary exploration changes nav state
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).selectedNodeId).toBe("n-customer");
		expect(nav(actor).activePerspectiveId).toBe("persp-overview");
		// Route is still paused, not lost
		expect(nav(actor).activeStoryRouteId).toBe("sr-payment-flow");
		expect(nav(actor).routeState).toBe("paused");

		// 8. RESUME_ROUTE — restores to waypoint 2 state
		actor.send({ type: "RESUME_ROUTE" });
		expect(nav(actor).routeState).toBe("active");
		expect(nav(actor).activeWaypointIndex).toBe(2);
		expect(nav(actor).activePerspectiveId).toBe("persp-architecture");
		expect(actor.getSnapshot().context.pausedRouteSnapshot).toBeNull();

		// 9. Continue to remaining waypoints
		actor.send({ type: "NEXT_WAYPOINT" }); // waypoint 3
		expect(nav(actor).activeWaypointIndex).toBe(3);
		// Waypoint 3 has perspectiveId: "persp-provider"
		expect(nav(actor).activePerspectiveId).toBe("persp-provider");
		// Waypoint 3 has provider focus target
		const providerTarget = nav(actor).activeFocusTargets.find((ft) => ft.type === "provider");
		expect(providerTarget).toBeDefined();
		expect(providerTarget?.targetId).toBe("prov-visa");

		actor.send({ type: "NEXT_WAYPOINT" }); // waypoint 4 (last)
		expect(nav(actor).activeWaypointIndex).toBe(4);
		// Waypoint 4 has process_stage focus target
		const stageTarget = nav(actor).activeFocusTargets.find((ft) => ft.type === "process_stage");
		expect(stageTarget).toBeDefined();

		// 10. Can't advance past last waypoint
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(nav(actor).activeWaypointIndex).toBe(4);

		// 11. END_ROUTE — clean state, domain preserved
		actor.send({ type: "END_ROUTE" });
		expect(nav(actor).activeStoryRouteId).toBeNull();
		expect(nav(actor).activeWaypointIndex).toBeNull();
		expect(nav(actor).routeState).toBe("inactive");
		expect(nav(actor).activeFocusTargets).toEqual([]);
		// Domain/capability context was changed during pause exploration,
		// but route end preserves whatever the current nav state is
		expect(nav(actor).activePerspectiveId).toBeDefined();
	});
});

describe("Story Route — pause preserves route-owned state", () => {
	it("temporary exploration does not mutate the route-owned focus snapshot", () => {
		const actor = createFullContext();
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		actor.send({ type: "NEXT_WAYPOINT" }); // waypoint 1

		const preePauseFocusTargets = [...nav(actor).activeFocusTargets];
		const prePausePerspective = nav(actor).activePerspectiveId;
		const prePauseWaypointIndex = nav(actor).activeWaypointIndex;

		// Pause
		actor.send({ type: "PAUSE_ROUTE" });

		// Explore — this changes nav state but should not affect the snapshot
		actor.send({ type: "SELECT_NODE", nodeId: "n-core-ledger" });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-process" });

		// Verify snapshot was NOT mutated by exploration
		const snapshot = actor.getSnapshot().context.pausedRouteSnapshot;
		expect(snapshot).not.toBeNull();
		expect(snapshot?.activeFocusTargets).toEqual(preePauseFocusTargets);
		expect(snapshot?.activePerspectiveId).toBe(prePausePerspective);
		expect(snapshot?.activeWaypointIndex).toBe(prePauseWaypointIndex);

		// Resume — should restore to pre-pause state
		actor.send({ type: "RESUME_ROUTE" });
		expect(nav(actor).activeFocusTargets).toEqual(preePauseFocusTargets);
		expect(nav(actor).activePerspectiveId).toBe(prePausePerspective);
		expect(nav(actor).activeWaypointIndex).toBe(prePauseWaypointIndex);
	});
});
