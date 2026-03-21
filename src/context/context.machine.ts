import { assign, setup } from "xstate";
import type { Capability } from "../entities/capability.js";
import type { Journey } from "../entities/journey.js";
import type { Step } from "../entities/step.js";
import type { TerrainGraph } from "../graph/graph.js";
import type { NavigationContext } from "./navigation-context.js";
import {
	reconcileCapabilitySwitch,
	reconcileDomainSwitch,
	reconcileJourneyDeselection,
	reconcileJourneySelection,
	reconcileModeSwitch,
	reconcileNodeSelection,
	reconcilePerspectiveSwitch,
	reconcileStepChange,
} from "./reconciler.js";

export interface ContextMachineContext {
	nav: NavigationContext;
	graph: TerrainGraph | null;
	journeys: Journey[];
	steps: Step[];
	capabilities: Capability[];
}

export type ContextMachineEvent =
	| {
			type: "INITIALIZE";
			graph: TerrainGraph;
			journeys: Journey[];
			steps: Step[];
			capabilities: Capability[];
	  }
	| { type: "SELECT_DOMAIN"; domainId: string }
	| { type: "SELECT_CAPABILITY"; capabilityId: string }
	| { type: "CLEAR_CAPABILITY" }
	| { type: "CLEAR_DOMAIN" }
	| { type: "SELECT_JOURNEY"; journeyId: string }
	| { type: "DESELECT_JOURNEY" }
	| { type: "STEP_FORWARD" }
	| { type: "STEP_BACKWARD" }
	| { type: "JUMP_TO_STEP"; index: number }
	| { type: "SWITCH_PERSPECTIVE"; perspectiveId: string }
	| { type: "SELECT_NODE"; nodeId: string }
	| { type: "SELECT_EDGE"; edgeId: string }
	| { type: "SWITCH_MODE"; mode: "viewscape" | "guiderail" };

function resolveStepsForJourney(journeyId: string, allSteps: Step[]): Step[] {
	return allSteps
		.filter((s) => s.journeyId === journeyId)
		.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}

export const contextMachine = setup({
	types: {
		context: {} as ContextMachineContext,
		events: {} as ContextMachineEvent,
	},
	guards: {
		hasGraph: ({ context }) => context.graph != null,
		canStepForward: ({ context }) => {
			if (context.nav.activeStepIndex == null) return false;
			const journeySteps = context.nav.activeJourneyId
				? resolveStepsForJourney(context.nav.activeJourneyId, context.steps)
				: [];
			return context.nav.activeStepIndex < journeySteps.length - 1;
		},
		canStepBackward: ({ context }) => {
			if (context.nav.activeStepIndex == null) return false;
			return context.nav.activeStepIndex > 0;
		},
		hasActiveJourney: ({ context }) => context.nav.activeJourneyId != null,
		isValidJourney: ({ context, event }) => {
			if (event.type !== "SELECT_JOURNEY") return false;
			return context.journeys.some((j) => j.id === event.journeyId);
		},
		isValidStepIndex: ({ context, event }) => {
			if (event.type !== "JUMP_TO_STEP") return false;
			if (context.nav.activeJourneyId == null) return false;
			const journeySteps = resolveStepsForJourney(context.nav.activeJourneyId, context.steps);
			return event.index >= 0 && event.index < journeySteps.length;
		},
	},
}).createMachine({
	id: "context",
	initial: "uninitialized",
	context: {
		nav: {
			activeDomainId: null,
			activeCapabilityId: null,
			activeJourneyId: null,
			activeStepIndex: null,
			activePerspectiveId: "",
			activeFocusTargets: [],
			selectedNodeId: null,
			selectedEdgeId: null,
			viewportAnchor: { x: 0, y: 0, zoom: 1 },
			activeSceneId: null,
			mode: "viewscape",
		},
		graph: null,
		journeys: [],
		steps: [],
		capabilities: [],
	},
	states: {
		uninitialized: {
			on: {
				INITIALIZE: {
					target: "ready",
					actions: assign(({ event }) => ({
						graph: event.graph,
						journeys: event.journeys,
						steps: event.steps,
						capabilities: event.capabilities,
					})),
				},
			},
		},
		ready: {
			on: {
				SELECT_DOMAIN: {
					actions: assign(({ context, event }) => ({
						nav: reconcileDomainSwitch(context.nav, event.domainId),
					})),
				},
				SELECT_CAPABILITY: {
					actions: assign(({ context, event }) => ({
						nav: reconcileCapabilitySwitch(context.nav, event.capabilityId),
					})),
				},
				CLEAR_CAPABILITY: {
					actions: assign(({ context }) => ({
						nav: {
							...context.nav,
							activeCapabilityId: null,
							activeJourneyId: null,
							activeStepIndex: null,
							activeFocusTargets: [],
							selectedNodeId: null,
							selectedEdgeId: null,
							activeSceneId: null,
						},
					})),
				},
				CLEAR_DOMAIN: {
					actions: assign(({ context }) => ({
						nav: {
							...context.nav,
							activeDomainId: null,
							activeCapabilityId: null,
							activeJourneyId: null,
							activeStepIndex: null,
							activeFocusTargets: [],
							selectedNodeId: null,
							selectedEdgeId: null,
							activeSceneId: null,
						},
					})),
				},
				SELECT_JOURNEY: {
					guard: "isValidJourney",
					actions: assign(({ context, event }) => {
						const journey = context.journeys.find((j) => j.id === event.journeyId);
						if (!journey || !context.graph) return {};
						const journeySteps = resolveStepsForJourney(journey.id, context.steps);
						return {
							nav: reconcileJourneySelection(
								context.nav,
								journey,
								journeySteps,
								context.capabilities,
								context.graph,
							),
						};
					}),
				},
				DESELECT_JOURNEY: {
					guard: "hasActiveJourney",
					actions: assign(({ context }) => ({
						nav: reconcileJourneyDeselection(context.nav),
					})),
				},
				STEP_FORWARD: {
					guard: "canStepForward",
					actions: assign(({ context }) => {
						if (context.nav.activeStepIndex == null || !context.graph) return {};
						const journeySteps = context.nav.activeJourneyId
							? resolveStepsForJourney(context.nav.activeJourneyId, context.steps)
							: [];
						return {
							nav: reconcileStepChange(
								context.nav,
								context.nav.activeStepIndex + 1,
								journeySteps,
								context.graph,
							),
						};
					}),
				},
				STEP_BACKWARD: {
					guard: "canStepBackward",
					actions: assign(({ context }) => {
						if (context.nav.activeStepIndex == null || !context.graph) return {};
						const journeySteps = context.nav.activeJourneyId
							? resolveStepsForJourney(context.nav.activeJourneyId, context.steps)
							: [];
						return {
							nav: reconcileStepChange(
								context.nav,
								context.nav.activeStepIndex - 1,
								journeySteps,
								context.graph,
							),
						};
					}),
				},
				JUMP_TO_STEP: {
					guard: "isValidStepIndex",
					actions: assign(({ context, event }) => {
						if (!context.graph) return {};
						const journeySteps = context.nav.activeJourneyId
							? resolveStepsForJourney(context.nav.activeJourneyId, context.steps)
							: [];
						return {
							nav: reconcileStepChange(context.nav, event.index, journeySteps, context.graph),
						};
					}),
				},
				SWITCH_PERSPECTIVE: {
					actions: assign(({ context, event }) => {
						if (!context.graph) return {};
						return {
							nav: reconcilePerspectiveSwitch(context.nav, event.perspectiveId, context.graph),
						};
					}),
				},
				SELECT_NODE: {
					actions: assign(({ context, event }) => {
						if (!context.graph) return {};
						const journeySteps = context.nav.activeJourneyId
							? resolveStepsForJourney(context.nav.activeJourneyId, context.steps)
							: [];
						return {
							nav: reconcileNodeSelection(context.nav, event.nodeId, journeySteps, context.graph),
						};
					}),
				},
				SELECT_EDGE: {
					actions: assign(({ context, event }) => ({
						nav: {
							...context.nav,
							selectedEdgeId: event.edgeId,
							selectedNodeId: null,
						},
					})),
				},
				SWITCH_MODE: {
					actions: assign(({ context, event }) => ({
						nav: reconcileModeSwitch(context.nav, event.mode),
					})),
				},
			},
		},
	},
});
