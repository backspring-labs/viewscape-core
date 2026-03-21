import { assign, setup } from "xstate";
import type { Step } from "../entities/step.js";

export interface JourneyMachineContext {
	journeyId: string | null;
	steps: Step[];
}

export type JourneyMachineEvent =
	| { type: "SELECT_JOURNEY"; journeyId: string }
	| { type: "JOURNEY_LOADED"; steps: Step[] }
	| { type: "DESELECT_JOURNEY" }
	| { type: "COMPLETE_JOURNEY" };

export const journeyMachine = setup({
	types: {
		context: {} as JourneyMachineContext,
		events: {} as JourneyMachineEvent,
	},
}).createMachine({
	id: "journey",
	initial: "idle",
	context: {
		journeyId: null,
		steps: [],
	},
	states: {
		idle: {
			on: {
				SELECT_JOURNEY: {
					target: "selecting",
					actions: assign({
						journeyId: ({ event }) => event.journeyId,
						steps: () => [],
					}),
				},
			},
		},
		selecting: {
			on: {
				JOURNEY_LOADED: {
					target: "active",
					actions: assign({
						steps: ({ event }) => event.steps,
					}),
				},
				DESELECT_JOURNEY: {
					target: "idle",
					actions: assign({
						journeyId: () => null,
						steps: () => [],
					}),
				},
			},
		},
		active: {
			on: {
				DESELECT_JOURNEY: {
					target: "idle",
					actions: assign({
						journeyId: () => null,
						steps: () => [],
					}),
				},
				COMPLETE_JOURNEY: {
					target: "completed",
				},
			},
		},
		completed: {
			on: {
				SELECT_JOURNEY: {
					target: "selecting",
					actions: assign({
						journeyId: ({ event }) => event.journeyId,
						steps: () => [],
					}),
				},
				DESELECT_JOURNEY: {
					target: "idle",
					actions: assign({
						journeyId: () => null,
						steps: () => [],
					}),
				},
			},
		},
	},
});
