import type { Capability } from "../entities/capability.js";
import type { FocusTarget } from "../entities/focus-target.js";
import type { Journey } from "../entities/journey.js";
import type { ProcessStage } from "../entities/process-stage.js";
import type { Process } from "../entities/process.js";
import type { Step } from "../entities/step.js";
import type { StoryRoute } from "../entities/story-route.js";
import type { StoryWaypoint } from "../entities/story-waypoint.js";
import type { ValueStream } from "../entities/value-stream.js";
import type { TerrainGraph } from "../graph/graph.js";
import type { NavigationContext } from "./navigation-context.js";

/**
 * Helpers for viewport positioning.
 */
function viewportForNode(
	nodeId: string,
	perspectiveId: string,
	graph: TerrainGraph,
	currentZoom: number,
): { x: number; y: number; zoom: number } {
	const node = graph.nodes.get(nodeId);
	const pos = node?.layoutByPerspective[perspectiveId];
	if (pos) {
		return { x: pos.x, y: pos.y, zoom: currentZoom };
	}
	return { x: 0, y: 0, zoom: currentZoom };
}

function primaryNodeFromFocusTargets(targets: FocusTarget[]): string | null {
	const nodeTarget = targets.find((t) => t.type === "node");
	return nodeTarget?.targetId ?? null;
}

/**
 * 1. Domain switch: set domain, clear capability/journey/step, preserve perspective.
 */
export function reconcileDomainSwitch(ctx: NavigationContext, domainId: string): NavigationContext {
	return {
		...ctx,
		activeDomainId: domainId,
		activeCapabilityId: null,
		activeJourneyId: null,
		activeStepIndex: null,
		activeFocusTargets: [],
		selectedNodeId: null,
		selectedEdgeId: null,
		activeSceneId: null,
		viewportAnchor: { x: 0, y: 0, zoom: ctx.viewportAnchor.zoom },
	};
}

/**
 * 2. Capability switch: set capability within domain, clear journey/step,
 *    preserve perspective.
 */
export function reconcileCapabilitySwitch(
	ctx: NavigationContext,
	capabilityId: string,
): NavigationContext {
	return {
		...ctx,
		activeCapabilityId: capabilityId,
		activeJourneyId: null,
		activeStepIndex: null,
		activeFocusTargets: [],
		selectedNodeId: null,
		selectedEdgeId: null,
		activeSceneId: null,
	};
}

/**
 * 3. Perspective switch: preserve domain/capability/journey/step entirely,
 *    update viewport to focal node's position in new perspective layout.
 */
export function reconcilePerspectiveSwitch(
	ctx: NavigationContext,
	perspectiveId: string,
	graph: TerrainGraph,
): NavigationContext {
	const primaryNode = primaryNodeFromFocusTargets(ctx.activeFocusTargets) ?? ctx.selectedNodeId;

	let viewportAnchor = ctx.viewportAnchor;
	if (primaryNode) {
		viewportAnchor = viewportForNode(primaryNode, perspectiveId, graph, ctx.viewportAnchor.zoom);
	}

	return {
		...ctx,
		activePerspectiveId: perspectiveId,
		viewportAnchor,
	};
}

/**
 * 4. Journey selection: set journey, infer domain/capability from
 *    entryCapabilityId if not already set (entry capability wins).
 */
export function reconcileJourneySelection(
	ctx: NavigationContext,
	journey: Journey,
	steps: Step[],
	capabilities: Capability[],
	graph: TerrainGraph,
): NavigationContext {
	const firstStep = steps.find((s) => s.sequenceNumber === 0) ?? steps[0];

	// Infer domain/capability from entry capability if not already set
	let activeDomainId = ctx.activeDomainId;
	let activeCapabilityId = ctx.activeCapabilityId;

	if (!activeCapabilityId) {
		activeCapabilityId = journey.entryCapabilityId;
	}
	if (!activeDomainId) {
		const entryCap = capabilities.find((c) => c.id === journey.entryCapabilityId);
		if (entryCap) {
			activeDomainId = entryCap.domainId;
		}
	}

	const focusTargets = firstStep?.focusTargets ?? [];
	const primaryNode = primaryNodeFromFocusTargets(focusTargets);
	const viewportAnchor = primaryNode
		? viewportForNode(primaryNode, ctx.activePerspectiveId, graph, ctx.viewportAnchor.zoom)
		: ctx.viewportAnchor;

	return {
		...ctx,
		activeDomainId,
		activeCapabilityId,
		activeJourneyId: journey.id,
		activeStepIndex: 0,
		activeFocusTargets: focusTargets,
		selectedNodeId: primaryNode,
		selectedEdgeId: null,
		activeSceneId: firstStep?.sceneId ?? null,
		viewportAnchor,
	};
}

/**
 * 5. Journey deselection: clear journey/step/scene, preserve domain/capability/perspective.
 */
export function reconcileJourneyDeselection(ctx: NavigationContext): NavigationContext {
	return {
		...ctx,
		activeJourneyId: null,
		activeStepIndex: null,
		activeFocusTargets: [],
		activeSceneId: null,
		// Preserve selectedNodeId — user may still have a node selected
	};
}

/**
 * 6. Step change: update focus targets, scene, capability if crossing boundary, viewport.
 */
export function reconcileStepChange(
	ctx: NavigationContext,
	stepIndex: number,
	steps: Step[],
	graph: TerrainGraph,
): NavigationContext {
	const step = steps.find((s) => s.sequenceNumber === stepIndex);
	if (!step) return ctx;

	const focusTargets = step.focusTargets;
	const primaryNode = primaryNodeFromFocusTargets(focusTargets);
	const viewportAnchor = primaryNode
		? viewportForNode(primaryNode, ctx.activePerspectiveId, graph, ctx.viewportAnchor.zoom)
		: ctx.viewportAnchor;

	// Update capability if step crosses into a different one
	const activeCapabilityId =
		step.capabilityId !== ctx.activeCapabilityId ? step.capabilityId : ctx.activeCapabilityId;

	return {
		...ctx,
		activeStepIndex: stepIndex,
		activeFocusTargets: focusTargets,
		selectedNodeId: primaryNode,
		selectedEdgeId: null,
		activeSceneId: step.sceneId ?? null,
		activeCapabilityId,
		viewportAnchor,
	};
}

/**
 * 7. Node selection: if node is on active journey path, optionally snap to step;
 *    otherwise just select without disrupting navigation state.
 */
export function reconcileNodeSelection(
	ctx: NavigationContext,
	nodeId: string,
	steps: Step[],
	graph: TerrainGraph,
): NavigationContext {
	// If a journey is active, check if this node is on the path
	if (ctx.activeJourneyId != null && steps.length > 0) {
		const matchingStep = steps.find((s) =>
			s.focusTargets.some((ft) => ft.type === "node" && ft.targetId === nodeId),
		);
		if (matchingStep) {
			// Snap to that step
			return reconcileStepChange(ctx, matchingStep.sequenceNumber, steps, graph);
		}
	}

	// Otherwise, just select the node without disrupting journey state
	return {
		...ctx,
		selectedNodeId: nodeId,
		selectedEdgeId: null,
	};
}

/**
 * 8. Mode switch: preserve all context, adjust viewport scope.
 */
export function reconcileModeSwitch(
	ctx: NavigationContext,
	mode: "viewscape" | "guiderail",
): NavigationContext {
	return {
		...ctx,
		mode,
	};
}

/**
 * 9. Value stream switch: set value stream, clear process.
 * Preserve activeCapabilityId only if it belongs to the selected value stream's capabilityIds.
 */
export function reconcileValueStreamSwitch(
	ctx: NavigationContext,
	valueStreamId: string,
	valueStream: ValueStream,
): NavigationContext {
	const capabilityPreserved =
		ctx.activeCapabilityId && valueStream.capabilityIds.includes(ctx.activeCapabilityId);

	return {
		...ctx,
		activeValueStreamId: valueStreamId,
		activeProcessId: null,
		activeCapabilityId: capabilityPreserved ? ctx.activeCapabilityId : null,
		activeJourneyId: capabilityPreserved ? ctx.activeJourneyId : null,
		activeStepIndex: capabilityPreserved ? ctx.activeStepIndex : null,
	};
}

/**
 * 10. Process switch: set process, update focus to first stage's nodes (v1 simplification).
 */
export function reconcileProcessSwitch(
	ctx: NavigationContext,
	processId: string,
	processStages: ProcessStage[],
	graph: TerrainGraph,
): NavigationContext {
	const orderedStages = [...processStages].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
	const firstStage = orderedStages[0];

	const focusTargets: FocusTarget[] =
		firstStage?.nodeIds.map((nodeId) => ({ type: "node" as const, targetId: nodeId })) ?? [];

	const primaryNode = primaryNodeFromFocusTargets(focusTargets);
	const viewportAnchor = primaryNode
		? viewportForNode(primaryNode, ctx.activePerspectiveId, graph, ctx.viewportAnchor.zoom)
		: ctx.viewportAnchor;

	return {
		...ctx,
		activeProcessId: processId,
		activeFocusTargets: focusTargets,
		viewportAnchor,
	};
}

/**
 * 11. Story route start: set route, load first waypoint, set routeState active.
 * Does NOT clear domain/capability — route is an overlay on the terrain.
 */
export function reconcileStoryRouteStart(
	ctx: NavigationContext,
	storyRoute: StoryRoute,
	waypoints: StoryWaypoint[],
	graph: TerrainGraph,
): NavigationContext {
	const orderedWaypoints = [...waypoints].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
	const firstWaypoint = orderedWaypoints[0];

	const focusTargets = firstWaypoint?.focusTargets ?? [];
	const primaryNode = primaryNodeFromFocusTargets(focusTargets);

	const perspectiveId = firstWaypoint?.perspectiveId ?? ctx.activePerspectiveId;
	const viewportAnchor = primaryNode
		? viewportForNode(primaryNode, perspectiveId, graph, ctx.viewportAnchor.zoom)
		: ctx.viewportAnchor;

	return {
		...ctx,
		activeStoryRouteId: storyRoute.id,
		activeWaypointIndex: 0,
		routeState: "active",
		activeFocusTargets: focusTargets,
		activePerspectiveId: perspectiveId,
		viewportAnchor,
	};
}

/**
 * 12. Waypoint change: update focus targets, perspective (if specified), viewport.
 */
export function reconcileWaypointChange(
	ctx: NavigationContext,
	waypointIndex: number,
	waypoints: StoryWaypoint[],
	graph: TerrainGraph,
): NavigationContext {
	const waypoint = waypoints.find((w) => w.sequenceNumber === waypointIndex);
	if (!waypoint) return ctx;

	const focusTargets = waypoint.focusTargets;
	const perspectiveId = waypoint.perspectiveId ?? ctx.activePerspectiveId;
	const primaryNode = primaryNodeFromFocusTargets(focusTargets);
	const viewportAnchor = primaryNode
		? viewportForNode(primaryNode, perspectiveId, graph, ctx.viewportAnchor.zoom)
		: ctx.viewportAnchor;

	return {
		...ctx,
		activeWaypointIndex: waypointIndex,
		activeFocusTargets: focusTargets,
		activePerspectiveId: perspectiveId,
		viewportAnchor,
	};
}

/**
 * 13. Route pause: set routeState to paused.
 * Snapshot is saved by Context Machine, not reconciler.
 * Temporary exploration during pause does not mutate the route-owned focus snapshot.
 */
export function reconcileRoutePause(ctx: NavigationContext): NavigationContext {
	return {
		...ctx,
		routeState: "paused",
	};
}

/**
 * 14. Route resume: restore focus/perspective/viewport from saved snapshot.
 */
export function reconcileRouteResume(
	ctx: NavigationContext,
	savedSnapshot: NavigationContext,
): NavigationContext {
	return {
		...ctx,
		activeFocusTargets: savedSnapshot.activeFocusTargets,
		activePerspectiveId: savedSnapshot.activePerspectiveId,
		viewportAnchor: savedSnapshot.viewportAnchor,
		activeWaypointIndex: savedSnapshot.activeWaypointIndex,
		routeState: "active",
	};
}

/**
 * 15. Route end: clear route state, preserve domain/capability/perspective.
 */
export function reconcileRouteEnd(ctx: NavigationContext): NavigationContext {
	return {
		...ctx,
		activeStoryRouteId: null,
		activeWaypointIndex: null,
		routeState: "inactive",
		activeFocusTargets: [],
	};
}
