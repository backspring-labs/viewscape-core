import { assign, setup } from "xstate";

export interface SourceMachineContext {
	sourceId: string | null;
	sourceType: "content_repo" | "code_repo" | null;
	attachedAt: string | null;
}

export type SourceMachineEvent =
	| { type: "ATTACH_SOURCE"; sourceId: string; sourceType: "content_repo" | "code_repo" }
	| { type: "SOURCE_ATTACHED"; attachedAt: string }
	| { type: "ATTACH_FAILED"; error: string }
	| { type: "DETACH_SOURCE" }
	| { type: "SOURCE_DETACHED" };

export const sourceMachine = setup({
	types: {
		context: {} as SourceMachineContext,
		events: {} as SourceMachineEvent,
	},
}).createMachine({
	id: "source",
	initial: "detached",
	context: {
		sourceId: null,
		sourceType: null,
		attachedAt: null,
	},
	states: {
		detached: {
			on: {
				ATTACH_SOURCE: {
					target: "attaching",
					actions: assign({
						sourceId: ({ event }) => event.sourceId,
						sourceType: ({ event }) => event.sourceType,
					}),
				},
			},
		},
		attaching: {
			on: {
				SOURCE_ATTACHED: {
					target: "attached",
					actions: assign({
						attachedAt: ({ event }) => event.attachedAt,
					}),
				},
				ATTACH_FAILED: {
					target: "detached",
					actions: assign({
						sourceId: () => null,
						sourceType: () => null,
						attachedAt: () => null,
					}),
				},
			},
		},
		attached: {
			on: {
				DETACH_SOURCE: {
					target: "detaching",
				},
			},
		},
		detaching: {
			on: {
				SOURCE_DETACHED: {
					target: "detached",
					actions: assign({
						sourceId: () => null,
						sourceType: () => null,
						attachedAt: () => null,
					}),
				},
			},
		},
	},
});
