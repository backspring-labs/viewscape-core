import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { contextMachine } from "../../src/context/context.machine.js";
import { createGraph } from "../../src/graph/graph.js";
import { capabilities, edges, journeys, nodes, steps } from "../../src/test-fixtures/index.js";

const graph = createGraph(nodes, edges);

function createInitializedContext() {
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

function nav(actor: ReturnType<typeof createActor<typeof contextMachine>>) {
	return actor.getSnapshot().context.nav;
}

describe("Integration Walkthrough — the user must never lose their place", () => {
	it("completes the full navigation flow", () => {
		const actor = createInitializedContext();

		// 1. Verify initial state
		expect(actor.getSnapshot().value).toBe("ready");
		expect(nav(actor).activeDomainId).toBeNull();

		// 2. Select domain "Accounts"
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activeCapabilityId).toBeNull();

		// 3. Select capability "Account Opening"
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");
		expect(nav(actor).activeDomainId).toBe("dom-accounts");

		// 4. Switch perspective to "Process" — domain/capability preserved
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-process" });
		expect(nav(actor).activePerspectiveId).toBe("persp-process");
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");

		// 5. Switch perspective to "Provider" — still preserved
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-provider" });
		expect(nav(actor).activePerspectiveId).toBe("persp-provider");
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");

		// 6. Select journey "Open Savings Account"
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		expect(nav(actor).activeJourneyId).toBe("j-open-savings");
		expect(nav(actor).activeStepIndex).toBe(0);
		expect(nav(actor).activeFocusTargets.length).toBeGreaterThan(0);
		expect(nav(actor).activeSceneId).toBe("sc-1");
		// Domain/capability preserved since they were already set
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");

		// 7. Step forward
		actor.send({ type: "STEP_FORWARD" });
		expect(nav(actor).activeStepIndex).toBe(1);
		expect(nav(actor).activeSceneId).toBe("sc-2");

		// 8. Switch perspective to "Architecture" — step preserved
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		expect(nav(actor).activePerspectiveId).toBe("persp-architecture");
		expect(nav(actor).activeStepIndex).toBe(1);
		expect(nav(actor).activeJourneyId).toBe("j-open-savings");
		expect(nav(actor).activeSceneId).toBe("sc-2");

		// 9. Step through remaining steps
		actor.send({ type: "STEP_FORWARD" }); // step 2
		actor.send({ type: "STEP_FORWARD" }); // step 3
		actor.send({ type: "STEP_FORWARD" }); // step 4
		actor.send({ type: "STEP_FORWARD" }); // step 5 (last)
		expect(nav(actor).activeStepIndex).toBe(5);
		expect(nav(actor).activeSceneId).toBe("sc-6");

		// Verify STEP_FORWARD is guarded at end
		actor.send({ type: "STEP_FORWARD" });
		expect(nav(actor).activeStepIndex).toBe(5);

		// 10. Step backward
		actor.send({ type: "STEP_BACKWARD" });
		expect(nav(actor).activeStepIndex).toBe(4);
		expect(nav(actor).activeSceneId).toBe("sc-5");

		// 11. Switch perspective back — verify full coherence
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-overview" });
		expect(nav(actor).activePerspectiveId).toBe("persp-overview");
		expect(nav(actor).activeStepIndex).toBe(4);
		expect(nav(actor).activeJourneyId).toBe("j-open-savings");
		expect(nav(actor).activeDomainId).toBe("dom-accounts");

		// 12. Select off-path node — journey not disrupted
		actor.send({ type: "SELECT_NODE", nodeId: "n-payment-orch" });
		expect(nav(actor).selectedNodeId).toBe("n-payment-orch");
		expect(nav(actor).activeStepIndex).toBe(4);
		expect(nav(actor).activeJourneyId).toBe("j-open-savings");

		// 13. Deselect journey — domain/capability preserved
		actor.send({ type: "DESELECT_JOURNEY" });
		expect(nav(actor).activeJourneyId).toBeNull();
		expect(nav(actor).activeStepIndex).toBeNull();
		expect(nav(actor).activeSceneId).toBeNull();
		expect(nav(actor).activeFocusTargets).toEqual([]);
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activePerspectiveId).toBe("persp-overview");

		// 14. Clear capability — domain preserved
		actor.send({ type: "CLEAR_CAPABILITY" });
		expect(nav(actor).activeCapabilityId).toBeNull();
		expect(nav(actor).activeDomainId).toBe("dom-accounts");

		// 15. Clear domain — clean state
		actor.send({ type: "CLEAR_DOMAIN" });
		expect(nav(actor).activeCapabilityId).toBeNull();
		expect(nav(actor).activeJourneyId).toBeNull();
		expect(nav(actor).activeStepIndex).toBeNull();
	});
});

describe("Journey inference — entry capability rule", () => {
	it("infers domain and capability from entryCapabilityId when not set", () => {
		const actor = createInitializedContext();

		// Select journey without prior domain/capability
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });

		// entryCapabilityId is cap-onboarding, which belongs to dom-customer
		expect(nav(actor).activeCapabilityId).toBe("cap-onboarding");
		expect(nav(actor).activeDomainId).toBe("dom-customer");
	});

	it("preserves existing domain/capability when already set", () => {
		const actor = createInitializedContext();

		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });

		// Should NOT override existing domain/capability
		expect(nav(actor).activeDomainId).toBe("dom-accounts");
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");
	});
});

describe("Capability boundary crossing during step traversal", () => {
	it("updates active capability when step crosses boundary", () => {
		const actor = createInitializedContext();

		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		// Steps 0-3 are in cap-onboarding, steps 4-5 are in cap-account-opening
		expect(nav(actor).activeCapabilityId).toBe("cap-onboarding");

		actor.send({ type: "STEP_FORWARD" }); // step 1 - onboarding
		actor.send({ type: "STEP_FORWARD" }); // step 2 - onboarding
		actor.send({ type: "STEP_FORWARD" }); // step 3 - onboarding
		expect(nav(actor).activeCapabilityId).toBe("cap-onboarding");

		actor.send({ type: "STEP_FORWARD" }); // step 4 - account-opening!
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");

		actor.send({ type: "STEP_FORWARD" }); // step 5 - account-opening
		expect(nav(actor).activeCapabilityId).toBe("cap-account-opening");

		// Step backward should restore
		actor.send({ type: "STEP_BACKWARD" }); // back to step 4
		actor.send({ type: "STEP_BACKWARD" }); // back to step 3 - onboarding!
		expect(nav(actor).activeCapabilityId).toBe("cap-onboarding");
	});
});

describe("Node selection snaps to step on active journey", () => {
	it("snaps to correct step when clicking a node on the journey path", () => {
		const actor = createInitializedContext();

		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		expect(nav(actor).activeStepIndex).toBe(0);

		// Click on n-identity-svc which is a focus target on step 2
		actor.send({ type: "SELECT_NODE", nodeId: "n-identity-svc" });
		expect(nav(actor).activeStepIndex).toBe(2);
		expect(nav(actor).activeSceneId).toBe("sc-3");
	});
});
