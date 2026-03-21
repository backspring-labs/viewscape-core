import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { contextMachine } from "../../src/context/context.machine.js";
import { createGraph } from "../../src/graph/graph.js";
import { capabilities, edges, journeys, nodes, steps } from "../../src/test-fixtures/index.js";

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
