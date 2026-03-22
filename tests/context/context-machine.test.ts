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

function createCtx() {
	const actor = createActor(contextMachine).start();
	actor.send({
		type: "INITIALIZE",
		graph,
		journeys,
		steps,
		capabilities,
	});
	return actor;
}

describe("Context Machine", () => {
	it("starts in uninitialized", () => {
		const actor = createActor(contextMachine).start();
		expect(actor.getSnapshot().value).toBe("uninitialized");
	});

	it("INITIALIZE transitions to ready", () => {
		const actor = createCtx();
		expect(actor.getSnapshot().value).toBe("ready");
		expect(actor.getSnapshot().context.graph).toBeDefined();
		expect(actor.getSnapshot().context.steps.length).toBe(6);
	});

	it("SELECT_DOMAIN updates nav context", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeDomainId).toBe("dom-accounts");
		expect(nav.activeCapabilityId).toBeNull();
	});

	it("SELECT_CAPABILITY updates nav context", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeCapabilityId).toBe("cap-account-opening");
	});

	it("CLEAR_DOMAIN clears domain and capability", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "CLEAR_DOMAIN" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeCapabilityId).toBeNull();
		expect(nav.activeJourneyId).toBeNull();
	});

	it("SWITCH_PERSPECTIVE preserves domain/capability", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activePerspectiveId).toBe("persp-architecture");
		expect(nav.activeDomainId).toBe("dom-accounts");
		expect(nav.activeCapabilityId).toBe("cap-account-opening");
	});

	it("SWITCH_MODE preserves all context", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SWITCH_MODE", mode: "guiderail" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.mode).toBe("guiderail");
		expect(nav.activeDomainId).toBe("dom-accounts");
	});

	it("SELECT_NODE updates selected node", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_NODE", nodeId: "n-core-ledger" });
		expect(actor.getSnapshot().context.nav.selectedNodeId).toBe("n-core-ledger");
	});

	it("SELECT_EDGE updates selected edge and clears node", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_NODE", nodeId: "n-core-ledger" });
		actor.send({ type: "SELECT_EDGE", edgeId: "e-account-ledger" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.selectedEdgeId).toBe("e-account-ledger");
		expect(nav.selectedNodeId).toBeNull();
	});

	it("rejects SELECT_JOURNEY for invalid journey", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "nonexistent" });
		expect(actor.getSnapshot().context.nav.activeJourneyId).toBeNull();
	});

	it("ignores events in uninitialized state", () => {
		const actor = createActor(contextMachine).start();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		expect(actor.getSnapshot().value).toBe("uninitialized");
	});

	it("SELECT_JOURNEY sets journey and step 0", () => {
		const actor = createCtx();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeJourneyId).toBe("j-open-savings");
		expect(nav.activeStepIndex).toBe(0);
		expect(nav.activeSceneId).toBe("sc-1");
	});
});

// --- 0.2.0 Context Machine tests ---

function createFullCtx() {
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

describe("Context Machine 0.2.0", () => {
	it("INITIALIZE without new fields still works (backward compat)", () => {
		const actor = createCtx();
		expect(actor.getSnapshot().value).toBe("ready");
		expect(actor.getSnapshot().context.providers).toEqual([]);
		expect(actor.getSnapshot().context.storyRoutes).toEqual([]);
	});

	it("INITIALIZE with new fields stores them", () => {
		const actor = createFullCtx();
		expect(actor.getSnapshot().context.providers.length).toBe(5);
		expect(actor.getSnapshot().context.storyRoutes.length).toBe(1);
		expect(actor.getSnapshot().context.storyWaypoints.length).toBe(5);
		expect(actor.getSnapshot().context.valueStreams.length).toBe(2);
		expect(actor.getSnapshot().context.processes.length).toBe(1);
		expect(actor.getSnapshot().context.processStages.length).toBe(4);
	});

	it("SELECT_VALUE_STREAM updates nav", () => {
		const actor = createFullCtx();
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		expect(actor.getSnapshot().context.nav.activeValueStreamId).toBe("vs-retail-payments");
	});

	it("CLEAR_VALUE_STREAM clears value stream and process", () => {
		const actor = createFullCtx();
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		actor.send({ type: "SELECT_PROCESS", processId: "proc-payment-auth" });
		actor.send({ type: "CLEAR_VALUE_STREAM" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeValueStreamId).toBeNull();
		expect(nav.activeProcessId).toBeNull();
	});

	it("SELECT_PROCESS updates nav", () => {
		const actor = createFullCtx();
		actor.send({ type: "SELECT_PROCESS", processId: "proc-payment-auth" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeProcessId).toBe("proc-payment-auth");
		expect(nav.activeFocusTargets.length).toBeGreaterThan(0);
	});

	it("CLEAR_PROCESS clears process", () => {
		const actor = createFullCtx();
		actor.send({ type: "SELECT_PROCESS", processId: "proc-payment-auth" });
		actor.send({ type: "CLEAR_PROCESS" });
		expect(actor.getSnapshot().context.nav.activeProcessId).toBeNull();
	});

	it("START_ROUTE sets route and first waypoint", () => {
		const actor = createFullCtx();
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeStoryRouteId).toBe("sr-payment-flow");
		expect(nav.activeWaypointIndex).toBe(0);
		expect(nav.routeState).toBe("active");
		expect(nav.activeFocusTargets.length).toBeGreaterThan(0);
	});

	it("START_ROUTE rejects invalid route", () => {
		const actor = createFullCtx();
		actor.send({ type: "START_ROUTE", storyRouteId: "nonexistent" });
		expect(actor.getSnapshot().context.nav.activeStoryRouteId).toBeNull();
	});

	it("NEXT_WAYPOINT advances", () => {
		const actor = createFullCtx();
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(actor.getSnapshot().context.nav.activeWaypointIndex).toBe(1);
	});

	it("PAUSE_ROUTE and RESUME_ROUTE cycle", () => {
		const actor = createFullCtx();
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		actor.send({ type: "NEXT_WAYPOINT" });

		// Pause
		actor.send({ type: "PAUSE_ROUTE" });
		expect(actor.getSnapshot().context.nav.routeState).toBe("paused");
		expect(actor.getSnapshot().context.pausedRouteSnapshot).not.toBeNull();

		// Explore during pause
		actor.send({ type: "SELECT_NODE", nodeId: "n-customer" });

		// Resume
		actor.send({ type: "RESUME_ROUTE" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.routeState).toBe("active");
		expect(nav.activeWaypointIndex).toBe(1);
		expect(actor.getSnapshot().context.pausedRouteSnapshot).toBeNull();
	});

	it("END_ROUTE clears route state", () => {
		const actor = createFullCtx();
		actor.send({ type: "START_ROUTE", storyRouteId: "sr-payment-flow" });
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		actor.send({ type: "END_ROUTE" });
		const nav = actor.getSnapshot().context.nav;
		expect(nav.activeStoryRouteId).toBeNull();
		expect(nav.routeState).toBe("inactive");
		expect(nav.activeDomainId).toBe("dom-payments");
	});
});
