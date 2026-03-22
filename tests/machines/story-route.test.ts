import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { storyRouteMachine } from "../../src/machines/story-route.machine.js";

function createRoute(totalWaypoints = 5) {
	const actor = createActor(storyRouteMachine).start();
	actor.send({ type: "START_ROUTE", storyRouteId: "sr-1", totalWaypoints });
	return actor;
}

describe("StoryRoute Machine", () => {
	it("starts in inactive", () => {
		const actor = createActor(storyRouteMachine).start();
		expect(actor.getSnapshot().value).toBe("inactive");
		expect(actor.getSnapshot().context.activeStoryRouteId).toBeNull();
	});

	it("START_ROUTE transitions to active at waypoint 0", () => {
		const actor = createRoute();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("active");
		expect(snap.context.activeStoryRouteId).toBe("sr-1");
		expect(snap.context.activeWaypointIndex).toBe(0);
		expect(snap.context.totalWaypoints).toBe(5);
		expect(snap.context.canAdvance).toBe(true);
		expect(snap.context.canGoBack).toBe(false);
	});

	it("NEXT_WAYPOINT advances index", () => {
		const actor = createRoute();
		actor.send({ type: "NEXT_WAYPOINT" });
		const snap = actor.getSnapshot();
		expect(snap.context.activeWaypointIndex).toBe(1);
		expect(snap.context.canGoBack).toBe(true);
	});

	it("NEXT_WAYPOINT is guarded at last waypoint", () => {
		const actor = createRoute(3);
		actor.send({ type: "NEXT_WAYPOINT" });
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(2);
		expect(actor.getSnapshot().context.canAdvance).toBe(false);
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(2);
	});

	it("PREVIOUS_WAYPOINT decrements index", () => {
		const actor = createRoute();
		actor.send({ type: "NEXT_WAYPOINT" });
		actor.send({ type: "NEXT_WAYPOINT" });
		actor.send({ type: "PREVIOUS_WAYPOINT" });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(1);
	});

	it("PREVIOUS_WAYPOINT is guarded at first waypoint", () => {
		const actor = createRoute();
		actor.send({ type: "PREVIOUS_WAYPOINT" });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(0);
	});

	it("JUMP_TO_WAYPOINT with valid index", () => {
		const actor = createRoute();
		actor.send({ type: "JUMP_TO_WAYPOINT", index: 3 });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(3);
	});

	it("JUMP_TO_WAYPOINT is guarded for invalid index", () => {
		const actor = createRoute();
		actor.send({ type: "JUMP_TO_WAYPOINT", index: -1 });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(0);
		actor.send({ type: "JUMP_TO_WAYPOINT", index: 10 });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(0);
	});

	it("PAUSE_ROUTE transitions to paused", () => {
		const actor = createRoute();
		actor.send({ type: "PAUSE_ROUTE" });
		expect(actor.getSnapshot().value).toBe("paused");
	});

	it("RESUME_ROUTE returns to active from paused", () => {
		const actor = createRoute();
		actor.send({ type: "PAUSE_ROUTE" });
		actor.send({ type: "RESUME_ROUTE" });
		expect(actor.getSnapshot().value).toBe("active");
	});

	it("END_ROUTE from active returns to inactive", () => {
		const actor = createRoute();
		actor.send({ type: "NEXT_WAYPOINT" });
		actor.send({ type: "END_ROUTE" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("inactive");
		expect(snap.context.activeStoryRouteId).toBeNull();
		expect(snap.context.totalWaypoints).toBe(0);
	});

	it("END_ROUTE from paused returns to inactive", () => {
		const actor = createRoute();
		actor.send({ type: "PAUSE_ROUTE" });
		actor.send({ type: "END_ROUTE" });
		expect(actor.getSnapshot().value).toBe("inactive");
	});

	it("ignores NEXT_WAYPOINT when paused", () => {
		const actor = createRoute();
		actor.send({ type: "NEXT_WAYPOINT" });
		actor.send({ type: "PAUSE_ROUTE" });
		actor.send({ type: "NEXT_WAYPOINT" });
		expect(actor.getSnapshot().context.activeWaypointIndex).toBe(1);
		expect(actor.getSnapshot().value).toBe("paused");
	});

	it("ignores PAUSE_ROUTE when inactive", () => {
		const actor = createActor(storyRouteMachine).start();
		actor.send({ type: "PAUSE_ROUTE" });
		expect(actor.getSnapshot().value).toBe("inactive");
	});
});
