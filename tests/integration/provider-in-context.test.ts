import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { contextMachine } from "../../src/context/context.machine.js";
import {
	getProcessesForCapability,
	getProvidersForCapability,
	getProvidersForValueStream,
} from "../../src/graph/graph.js";
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

describe("Provider in Context — end-to-end visibility", () => {
	it("providers are visible through capability context", () => {
		const actor = createFullContext();

		// 1. Select domain and capability
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-payment-processing" });
		expect(nav(actor).activeDomainId).toBe("dom-payments");
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");

		// 2. Verify providers for this capability
		const capProviders = getProvidersForCapability("cap-payment-processing", providerAssociations);
		expect(capProviders).toContain("prov-visa");
		expect(capProviders).toContain("prov-mastercard");
		expect(capProviders).not.toContain("prov-rtp");
		expect(capProviders).not.toContain("prov-fednow");

		// 3. Check money movement capability has different providers
		const movementProviders = getProvidersForCapability("cap-money-movement", providerAssociations);
		expect(movementProviders).toContain("prov-rtp");
		expect(movementProviders).toContain("prov-fednow");
		expect(movementProviders).not.toContain("prov-visa");
	});

	it("providers are visible through value stream context", () => {
		const actor = createFullContext();

		// 1. Select value stream
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		expect(nav(actor).activeValueStreamId).toBe("vs-retail-payments");

		// 2. Verify providers for this value stream
		const vsProviders = getProvidersForValueStream("vs-retail-payments", providerAssociations);
		expect(vsProviders).toContain("prov-rtp");
		expect(vsProviders).toContain("prov-fednow");
	});

	it("processes are visible through capability context", () => {
		// Verify process for payment processing capability
		const capProcesses = getProcessesForCapability("cap-payment-processing", processes);
		expect(capProcesses.length).toBe(1);
		expect(capProcesses[0]?.label).toBe("Payment Authorization");
		expect(capProcesses[0]?.stageIds.length).toBe(4);
	});

	it("provider associations persist across perspective switches", () => {
		const actor = createFullContext();

		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-payment-processing" });

		// Providers for capability before perspective switch
		const beforeSwitch = getProvidersForCapability("cap-payment-processing", providerAssociations);

		// Switch perspective
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-provider" });
		expect(nav(actor).activePerspectiveId).toBe("persp-provider");

		// Providers should be the same — associations are data, not view-dependent
		const afterSwitch = getProvidersForCapability("cap-payment-processing", providerAssociations);
		expect(afterSwitch).toEqual(beforeSwitch);

		// Domain and capability preserved
		expect(nav(actor).activeDomainId).toBe("dom-payments");
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");
	});

	it("value stream switch with capability ambiguity rule", () => {
		const actor = createFullContext();

		// Set a capability that belongs to the value stream
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-money-movement" });

		// Select value stream — capability should be preserved (it's in the value stream)
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		expect(nav(actor).activeCapabilityId).toBe("cap-money-movement");

		// Now set a capability NOT in the value stream
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-auth" });
		// Reselect value stream — capability should be cleared
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		expect(nav(actor).activeCapabilityId).toBeNull();
	});

	it("full navigation chain: domain → value stream → capability → process → provider check", () => {
		const actor = createFullContext();

		// Domain
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		expect(nav(actor).activeDomainId).toBe("dom-payments");

		// Value stream
		actor.send({ type: "SELECT_VALUE_STREAM", valueStreamId: "vs-retail-payments" });
		expect(nav(actor).activeValueStreamId).toBe("vs-retail-payments");

		// Capability
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-payment-processing" });
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");

		// Process
		actor.send({ type: "SELECT_PROCESS", processId: "proc-payment-auth" });
		expect(nav(actor).activeProcessId).toBe("proc-payment-auth");
		expect(nav(actor).activeFocusTargets.length).toBeGreaterThan(0);

		// Provider check — all contexts are set, providers visible
		const capProviders = getProvidersForCapability("cap-payment-processing", providerAssociations);
		expect(capProviders).toContain("prov-visa");
		expect(capProviders).toContain("prov-mastercard");

		const vsProviders = getProvidersForValueStream("vs-retail-payments", providerAssociations);
		expect(vsProviders).toContain("prov-rtp");
		expect(vsProviders).toContain("prov-fednow");

		// Perspective switch preserves everything
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		expect(nav(actor).activeDomainId).toBe("dom-payments");
		expect(nav(actor).activeValueStreamId).toBe("vs-retail-payments");
		expect(nav(actor).activeCapabilityId).toBe("cap-payment-processing");
		expect(nav(actor).activeProcessId).toBe("proc-payment-auth");
	});
});
