import { assign, setup } from "xstate";

export interface StoryRouteMachineContext {
	activeStoryRouteId: string | null;
	activeWaypointIndex: number;
	totalWaypoints: number;
	canAdvance: boolean;
	canGoBack: boolean;
}

export type StoryRouteMachineEvent =
	| { type: "START_ROUTE"; storyRouteId: string; totalWaypoints: number }
	| { type: "NEXT_WAYPOINT" }
	| { type: "PREVIOUS_WAYPOINT" }
	| { type: "JUMP_TO_WAYPOINT"; index: number }
	| { type: "PAUSE_ROUTE" }
	| { type: "RESUME_ROUTE" }
	| { type: "END_ROUTE" };

function computeNav(index: number, total: number) {
	return {
		canAdvance: index < total - 1,
		canGoBack: index > 0,
	};
}

export const storyRouteMachine = setup({
	types: {
		context: {} as StoryRouteMachineContext,
		events: {} as StoryRouteMachineEvent,
	},
	guards: {
		canAdvance: ({ context }) => context.activeWaypointIndex < context.totalWaypoints - 1,
		canGoBack: ({ context }) => context.activeWaypointIndex > 0,
		isValidWaypointIndex: ({ context, event }) => {
			if (event.type !== "JUMP_TO_WAYPOINT") return false;
			return event.index >= 0 && event.index < context.totalWaypoints;
		},
	},
}).createMachine({
	id: "storyRoute",
	initial: "inactive",
	context: {
		activeStoryRouteId: null,
		activeWaypointIndex: 0,
		totalWaypoints: 0,
		canAdvance: false,
		canGoBack: false,
	},
	states: {
		inactive: {
			on: {
				START_ROUTE: {
					target: "active",
					actions: assign(({ event }) => ({
						activeStoryRouteId: event.storyRouteId,
						activeWaypointIndex: 0,
						totalWaypoints: event.totalWaypoints,
						...computeNav(0, event.totalWaypoints),
					})),
				},
			},
		},
		active: {
			on: {
				NEXT_WAYPOINT: {
					guard: "canAdvance",
					actions: assign(({ context }) => {
						const next = context.activeWaypointIndex + 1;
						return {
							activeWaypointIndex: next,
							...computeNav(next, context.totalWaypoints),
						};
					}),
				},
				PREVIOUS_WAYPOINT: {
					guard: "canGoBack",
					actions: assign(({ context }) => {
						const prev = context.activeWaypointIndex - 1;
						return {
							activeWaypointIndex: prev,
							...computeNav(prev, context.totalWaypoints),
						};
					}),
				},
				JUMP_TO_WAYPOINT: {
					guard: "isValidWaypointIndex",
					actions: assign(({ context, event }) => ({
						activeWaypointIndex: event.index,
						...computeNav(event.index, context.totalWaypoints),
					})),
				},
				PAUSE_ROUTE: {
					target: "paused",
				},
				END_ROUTE: {
					target: "inactive",
					actions: assign({
						activeStoryRouteId: () => null,
						activeWaypointIndex: () => 0,
						totalWaypoints: () => 0,
						canAdvance: () => false,
						canGoBack: () => false,
					}),
				},
			},
		},
		paused: {
			on: {
				RESUME_ROUTE: {
					target: "active",
				},
				END_ROUTE: {
					target: "inactive",
					actions: assign({
						activeStoryRouteId: () => null,
						activeWaypointIndex: () => 0,
						totalWaypoints: () => 0,
						canAdvance: () => false,
						canGoBack: () => false,
					}),
				},
			},
		},
	},
});
