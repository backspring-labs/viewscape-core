import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { journeyMachine } from "../../src/machines/journey.machine.js";
import { steps as seedSteps } from "../../src/test-fixtures/index.js";

function createJourney() {
	return createActor(journeyMachine).start();
}

describe("Journey Machine", () => {
	it("starts in idle with null journey", () => {
		const actor = createJourney();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.journeyId).toBeNull();
		expect(snap.context.steps).toEqual([]);
	});

	it("SELECT_JOURNEY transitions to selecting", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("selecting");
		expect(snap.context.journeyId).toBe("j-open-savings");
		expect(snap.context.steps).toEqual([]);
	});

	it("JOURNEY_LOADED transitions to active with steps", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		actor.send({ type: "JOURNEY_LOADED", steps: seedSteps });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("active");
		expect(snap.context.steps.length).toBe(6);
	});

	it("DESELECT_JOURNEY from active returns to idle and clears context", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		actor.send({ type: "JOURNEY_LOADED", steps: seedSteps });
		actor.send({ type: "DESELECT_JOURNEY" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.journeyId).toBeNull();
		expect(snap.context.steps).toEqual([]);
	});

	it("DESELECT_JOURNEY from selecting returns to idle", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		actor.send({ type: "DESELECT_JOURNEY" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
	});

	it("COMPLETE_JOURNEY transitions to completed", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		actor.send({ type: "JOURNEY_LOADED", steps: seedSteps });
		actor.send({ type: "COMPLETE_JOURNEY" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("completed");
		expect(snap.context.journeyId).toBe("j-open-savings");
	});

	it("can select a new journey from completed state", () => {
		const actor = createJourney();
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-open-savings" });
		actor.send({ type: "JOURNEY_LOADED", steps: seedSteps });
		actor.send({ type: "COMPLETE_JOURNEY" });
		actor.send({ type: "SELECT_JOURNEY", journeyId: "j-other" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("selecting");
		expect(snap.context.journeyId).toBe("j-other");
		expect(snap.context.steps).toEqual([]);
	});

	it("ignores COMPLETE_JOURNEY from idle", () => {
		const actor = createJourney();
		actor.send({ type: "COMPLETE_JOURNEY" });
		expect(actor.getSnapshot().value).toBe("idle");
	});

	it("ignores JOURNEY_LOADED from idle", () => {
		const actor = createJourney();
		actor.send({ type: "JOURNEY_LOADED", steps: seedSteps });
		expect(actor.getSnapshot().value).toBe("idle");
		expect(actor.getSnapshot().context.steps).toEqual([]);
	});
});
