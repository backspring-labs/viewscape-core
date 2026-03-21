import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { routeMachine } from "../../src/machines/route.machine.js";

function createRoute(totalSteps = 6) {
	const actor = createActor(routeMachine).start();
	actor.send({ type: "ROUTE_STARTED", totalSteps });
	return actor;
}

describe("Route Machine", () => {
	it("starts in idle", () => {
		const actor = createActor(routeMachine).start();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.totalSteps).toBe(0);
	});

	it("ROUTE_STARTED transitions to navigating at step 0", () => {
		const actor = createRoute();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("navigating");
		expect(snap.context.currentStepIndex).toBe(0);
		expect(snap.context.totalSteps).toBe(6);
		expect(snap.context.canGoForward).toBe(true);
		expect(snap.context.canGoBack).toBe(false);
	});

	it("STEP_FORWARD increments index", () => {
		const actor = createRoute();
		actor.send({ type: "STEP_FORWARD" });
		const snap = actor.getSnapshot();
		expect(snap.context.currentStepIndex).toBe(1);
		expect(snap.context.canGoForward).toBe(true);
		expect(snap.context.canGoBack).toBe(true);
	});

	it("STEP_FORWARD is guarded at last step", () => {
		const actor = createRoute(3);
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(2);
		expect(actor.getSnapshot().context.canGoForward).toBe(false);

		actor.send({ type: "STEP_FORWARD" });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(2);
	});

	it("STEP_BACKWARD decrements index", () => {
		const actor = createRoute();
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_BACKWARD" });
		const snap = actor.getSnapshot();
		expect(snap.context.currentStepIndex).toBe(1);
	});

	it("STEP_BACKWARD is guarded at first step", () => {
		const actor = createRoute();
		actor.send({ type: "STEP_BACKWARD" });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(0);
	});

	it("JUMP_TO_STEP with valid index", () => {
		const actor = createRoute();
		actor.send({ type: "JUMP_TO_STEP", index: 4 });
		const snap = actor.getSnapshot();
		expect(snap.context.currentStepIndex).toBe(4);
		expect(snap.context.canGoForward).toBe(true);
		expect(snap.context.canGoBack).toBe(true);
	});

	it("JUMP_TO_STEP is guarded for invalid index", () => {
		const actor = createRoute();
		actor.send({ type: "JUMP_TO_STEP", index: -1 });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(0);

		actor.send({ type: "JUMP_TO_STEP", index: 10 });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(0);
	});

	it("RESET returns to step 0", () => {
		const actor = createRoute();
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "RESET" });
		const snap = actor.getSnapshot();
		expect(snap.context.currentStepIndex).toBe(0);
		expect(snap.context.canGoBack).toBe(false);
		expect(snap.context.canGoForward).toBe(true);
	});

	it("ROUTE_ENDED returns to idle and clears state", () => {
		const actor = createRoute();
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "ROUTE_ENDED" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.currentStepIndex).toBe(0);
		expect(snap.context.totalSteps).toBe(0);
	});

	it("ignores STEP_FORWARD in idle", () => {
		const actor = createActor(routeMachine).start();
		actor.send({ type: "STEP_FORWARD" });
		expect(actor.getSnapshot().value).toBe("idle");
	});

	it("full step-through: forward to end and back to start", () => {
		const actor = createRoute(4);
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		actor.send({ type: "STEP_FORWARD" });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(3);
		expect(actor.getSnapshot().context.canGoForward).toBe(false);

		actor.send({ type: "STEP_BACKWARD" });
		actor.send({ type: "STEP_BACKWARD" });
		actor.send({ type: "STEP_BACKWARD" });
		expect(actor.getSnapshot().context.currentStepIndex).toBe(0);
		expect(actor.getSnapshot().context.canGoBack).toBe(false);
	});
});
