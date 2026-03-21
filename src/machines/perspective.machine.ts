import { assign, setup } from "xstate";

export interface PerspectiveMachineContext {
	activePerspectiveId: string;
	previousPerspectiveId: string | null;
	availablePerspectiveIds: string[];
}

export type PerspectiveMachineEvent =
	| { type: "SWITCH_PERSPECTIVE"; perspectiveId: string }
	| { type: "PERSPECTIVES_LOADED"; perspectiveIds: string[] };

export const perspectiveMachine = setup({
	types: {
		context: {} as PerspectiveMachineContext,
		events: {} as PerspectiveMachineEvent,
	},
	guards: {
		isValidPerspective: ({ context, event }) => {
			if (event.type !== "SWITCH_PERSPECTIVE") return false;
			return context.availablePerspectiveIds.includes(event.perspectiveId);
		},
		isNotCurrentPerspective: ({ context, event }) => {
			if (event.type !== "SWITCH_PERSPECTIVE") return false;
			return context.activePerspectiveId !== event.perspectiveId;
		},
	},
}).createMachine({
	id: "perspective",
	initial: "active",
	context: {
		activePerspectiveId: "",
		previousPerspectiveId: null,
		availablePerspectiveIds: [],
	},
	states: {
		active: {
			on: {
				SWITCH_PERSPECTIVE: {
					guard: { type: "isValidPerspective" },
					actions: assign(({ context, event }) => ({
						previousPerspectiveId: context.activePerspectiveId,
						activePerspectiveId: event.perspectiveId,
					})),
				},
				PERSPECTIVES_LOADED: {
					actions: assign(({ context, event }) => {
						const ids = event.perspectiveIds;
						const active =
							context.activePerspectiveId && ids.includes(context.activePerspectiveId)
								? context.activePerspectiveId
								: (ids[0] ?? "");
						return {
							availablePerspectiveIds: ids,
							activePerspectiveId: active,
						};
					}),
				},
			},
		},
	},
});
