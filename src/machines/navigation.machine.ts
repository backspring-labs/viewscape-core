import { assign, setup } from "xstate";

export interface NavigationMachineContext {
	activeDomainId: string | null;
	activeCapabilityId: string | null;
}

export type NavigationMachineEvent =
	| { type: "SELECT_DOMAIN"; domainId: string }
	| { type: "SELECT_CAPABILITY"; capabilityId: string }
	| { type: "CLEAR_CAPABILITY" }
	| { type: "CLEAR_DOMAIN" };

export const navigationMachine = setup({
	types: {
		context: {} as NavigationMachineContext,
		events: {} as NavigationMachineEvent,
	},
	guards: {
		hasDomain: ({ context }) => context.activeDomainId != null,
		hasCapability: ({ context }) => context.activeCapabilityId != null,
	},
}).createMachine({
	id: "navigation",
	initial: "atRoot",
	context: {
		activeDomainId: null,
		activeCapabilityId: null,
	},
	states: {
		atRoot: {
			on: {
				SELECT_DOMAIN: {
					target: "atDomainLevel",
					actions: assign({
						activeDomainId: ({ event }) => event.domainId,
						activeCapabilityId: () => null,
					}),
				},
			},
		},
		atDomainLevel: {
			on: {
				SELECT_CAPABILITY: {
					target: "atCapabilityLevel",
					actions: assign({
						activeCapabilityId: ({ event }) => event.capabilityId,
					}),
				},
				SELECT_DOMAIN: {
					target: "atDomainLevel",
					actions: assign({
						activeDomainId: ({ event }) => event.domainId,
						activeCapabilityId: () => null,
					}),
				},
				CLEAR_DOMAIN: {
					target: "atRoot",
					actions: assign({
						activeDomainId: () => null,
						activeCapabilityId: () => null,
					}),
				},
			},
		},
		atCapabilityLevel: {
			on: {
				SELECT_CAPABILITY: {
					target: "atCapabilityLevel",
					actions: assign({
						activeCapabilityId: ({ event }) => event.capabilityId,
					}),
				},
				SELECT_DOMAIN: {
					target: "atDomainLevel",
					actions: assign({
						activeDomainId: ({ event }) => event.domainId,
						activeCapabilityId: () => null,
					}),
				},
				CLEAR_CAPABILITY: {
					target: "atDomainLevel",
					actions: assign({
						activeCapabilityId: () => null,
					}),
				},
				CLEAR_DOMAIN: {
					target: "atRoot",
					actions: assign({
						activeDomainId: () => null,
						activeCapabilityId: () => null,
					}),
				},
			},
		},
	},
});
