import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { navigationMachine } from "../../src/machines/navigation.machine.js";

function createNav() {
	return createActor(navigationMachine).start();
}

describe("Navigation Machine", () => {
	it("starts at atRoot with null domain and capability", () => {
		const actor = createNav();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atRoot");
		expect(snap.context.activeDomainId).toBeNull();
		expect(snap.context.activeCapabilityId).toBeNull();
	});

	it("SELECT_DOMAIN transitions to atDomainLevel", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atDomainLevel");
		expect(snap.context.activeDomainId).toBe("dom-accounts");
		expect(snap.context.activeCapabilityId).toBeNull();
	});

	it("SELECT_CAPABILITY transitions to atCapabilityLevel", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atCapabilityLevel");
		expect(snap.context.activeDomainId).toBe("dom-accounts");
		expect(snap.context.activeCapabilityId).toBe("cap-account-opening");
	});

	it("CLEAR_CAPABILITY returns to atDomainLevel preserving domain", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "CLEAR_CAPABILITY" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atDomainLevel");
		expect(snap.context.activeDomainId).toBe("dom-accounts");
		expect(snap.context.activeCapabilityId).toBeNull();
	});

	it("CLEAR_DOMAIN from atCapabilityLevel cascades to atRoot", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "CLEAR_DOMAIN" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atRoot");
		expect(snap.context.activeDomainId).toBeNull();
		expect(snap.context.activeCapabilityId).toBeNull();
	});

	it("CLEAR_DOMAIN from atDomainLevel returns to atRoot", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "CLEAR_DOMAIN" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atRoot");
		expect(snap.context.activeDomainId).toBeNull();
	});

	it("switching domain clears capability", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-payments" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atDomainLevel");
		expect(snap.context.activeDomainId).toBe("dom-payments");
		expect(snap.context.activeCapabilityId).toBeNull();
	});

	it("switching capability within same domain stays at atCapabilityLevel", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_DOMAIN", domainId: "dom-accounts" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-servicing" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atCapabilityLevel");
		expect(snap.context.activeCapabilityId).toBe("cap-account-servicing");
	});

	it("ignores SELECT_CAPABILITY at atRoot (no domain selected)", () => {
		const actor = createNav();
		actor.send({ type: "SELECT_CAPABILITY", capabilityId: "cap-account-opening" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("atRoot");
		expect(snap.context.activeCapabilityId).toBeNull();
	});
});
