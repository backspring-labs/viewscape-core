import { assign, setup } from "xstate";

export interface IndexGenerationMachineContext {
	indexId: string | null;
	sourceId: string | null;
	progress: number;
	error: string | null;
}

export type IndexGenerationMachineEvent =
	| { type: "START_INDEX"; sourceId: string }
	| { type: "INDEX_PROGRESS"; progress: number }
	| { type: "INDEX_COMPLETE"; indexId: string }
	| { type: "INDEX_FAILED"; error: string }
	| { type: "REBUILD_INDEX" }
	| { type: "INVALIDATE_INDEX" };

export const indexGenerationMachine = setup({
	types: {
		context: {} as IndexGenerationMachineContext,
		events: {} as IndexGenerationMachineEvent,
	},
	guards: {
		hasSourceId: ({ context }) => context.sourceId != null,
	},
}).createMachine({
	id: "indexGeneration",
	initial: "idle",
	context: {
		indexId: null,
		sourceId: null,
		progress: 0,
		error: null,
	},
	states: {
		idle: {
			on: {
				START_INDEX: {
					target: "generating",
					actions: assign({
						sourceId: ({ event }) => event.sourceId,
						indexId: () => null,
						progress: () => 0,
						error: () => null,
					}),
				},
			},
		},
		generating: {
			on: {
				INDEX_PROGRESS: {
					actions: assign({
						progress: ({ event }) => event.progress,
					}),
				},
				INDEX_COMPLETE: {
					target: "ready",
					actions: assign({
						indexId: ({ event }) => event.indexId,
						progress: () => 100,
					}),
				},
				INDEX_FAILED: {
					target: "error",
					actions: assign({
						error: ({ event }) => event.error,
						progress: () => 0,
					}),
				},
			},
		},
		ready: {
			on: {
				REBUILD_INDEX: {
					target: "generating",
					actions: assign({
						indexId: () => null,
						progress: () => 0,
						error: () => null,
					}),
				},
				INVALIDATE_INDEX: {
					target: "idle",
					actions: assign({
						indexId: () => null,
						progress: () => 0,
					}),
				},
			},
		},
		error: {
			on: {
				START_INDEX: {
					target: "generating",
					actions: assign({
						sourceId: ({ event }) => event.sourceId,
						indexId: () => null,
						progress: () => 0,
						error: () => null,
					}),
				},
				INVALIDATE_INDEX: {
					target: "idle",
					actions: assign({
						indexId: () => null,
						sourceId: () => null,
						progress: () => 0,
						error: () => null,
					}),
				},
			},
		},
	},
});
