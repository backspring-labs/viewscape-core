import { assign, setup } from "xstate";

export interface RouteMachineContext {
	currentStepIndex: number;
	totalSteps: number;
	canGoForward: boolean;
	canGoBack: boolean;
}

export type RouteMachineEvent =
	| { type: "ROUTE_STARTED"; totalSteps: number }
	| { type: "STEP_FORWARD" }
	| { type: "STEP_BACKWARD" }
	| { type: "JUMP_TO_STEP"; index: number }
	| { type: "RESET" }
	| { type: "ROUTE_ENDED" };

function computeNav(index: number, total: number) {
	return {
		canGoForward: index < total - 1,
		canGoBack: index > 0,
	};
}

export const routeMachine = setup({
	types: {
		context: {} as RouteMachineContext,
		events: {} as RouteMachineEvent,
	},
	guards: {
		canStepForward: ({ context }) => context.currentStepIndex < context.totalSteps - 1,
		canStepBackward: ({ context }) => context.currentStepIndex > 0,
		isValidStepIndex: ({ context, event }) => {
			if (event.type !== "JUMP_TO_STEP") return false;
			return event.index >= 0 && event.index < context.totalSteps;
		},
	},
}).createMachine({
	id: "route",
	initial: "idle",
	context: {
		currentStepIndex: 0,
		totalSteps: 0,
		canGoForward: false,
		canGoBack: false,
	},
	states: {
		idle: {
			on: {
				ROUTE_STARTED: {
					target: "navigating",
					actions: assign(({ event }) => ({
						currentStepIndex: 0,
						totalSteps: event.totalSteps,
						...computeNav(0, event.totalSteps),
					})),
				},
			},
		},
		navigating: {
			on: {
				STEP_FORWARD: {
					guard: "canStepForward",
					actions: assign(({ context }) => {
						const next = context.currentStepIndex + 1;
						return {
							currentStepIndex: next,
							...computeNav(next, context.totalSteps),
						};
					}),
				},
				STEP_BACKWARD: {
					guard: "canStepBackward",
					actions: assign(({ context }) => {
						const prev = context.currentStepIndex - 1;
						return {
							currentStepIndex: prev,
							...computeNav(prev, context.totalSteps),
						};
					}),
				},
				JUMP_TO_STEP: {
					guard: "isValidStepIndex",
					actions: assign(({ context, event }) => ({
						currentStepIndex: event.index,
						...computeNav(event.index, context.totalSteps),
					})),
				},
				RESET: {
					actions: assign(({ context }) => ({
						currentStepIndex: 0,
						...computeNav(0, context.totalSteps),
					})),
				},
				ROUTE_ENDED: {
					target: "idle",
					actions: assign({
						currentStepIndex: () => 0,
						totalSteps: () => 0,
						canGoForward: () => false,
						canGoBack: () => false,
					}),
				},
			},
		},
	},
});
