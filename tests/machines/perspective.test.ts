import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { perspectiveMachine } from "../../src/machines/perspective.machine.js";

const perspectiveIds = [
	"persp-overview",
	"persp-architecture",
	"persp-provider",
	"persp-process",
	"persp-journey",
];

function createPersp() {
	const actor = createActor(perspectiveMachine).start();
	actor.send({ type: "PERSPECTIVES_LOADED", perspectiveIds });
	return actor;
}

describe("Perspective Machine", () => {
	it("starts in active state", () => {
		const actor = createActor(perspectiveMachine).start();
		expect(actor.getSnapshot().value).toBe("active");
	});

	it("PERSPECTIVES_LOADED sets available perspectives and selects first", () => {
		const actor = createPersp();
		const snap = actor.getSnapshot();
		expect(snap.context.availablePerspectiveIds).toEqual(perspectiveIds);
		expect(snap.context.activePerspectiveId).toBe("persp-overview");
	});

	it("PERSPECTIVES_LOADED preserves current perspective if still valid", () => {
		const actor = createActor(
			perspectiveMachine.provide({
				// Override initial context
			}),
			{
				input: undefined,
				snapshot: undefined,
			},
		).start();
		actor.send({ type: "PERSPECTIVES_LOADED", perspectiveIds });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		actor.send({ type: "PERSPECTIVES_LOADED", perspectiveIds });
		expect(actor.getSnapshot().context.activePerspectiveId).toBe("persp-architecture");
	});

	it("SWITCH_PERSPECTIVE updates active and stores previous", () => {
		const actor = createPersp();
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		const snap = actor.getSnapshot();
		expect(snap.context.activePerspectiveId).toBe("persp-architecture");
		expect(snap.context.previousPerspectiveId).toBe("persp-overview");
	});

	it("SWITCH_PERSPECTIVE is guarded for invalid perspective", () => {
		const actor = createPersp();
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-nonexistent" });
		expect(actor.getSnapshot().context.activePerspectiveId).toBe("persp-overview");
	});

	it("multiple perspective switches track previous correctly", () => {
		const actor = createPersp();
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-architecture" });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-provider" });
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-process" });
		const snap = actor.getSnapshot();
		expect(snap.context.activePerspectiveId).toBe("persp-process");
		expect(snap.context.previousPerspectiveId).toBe("persp-provider");
	});

	it("switching perspective does NOT affect machine state (always active)", () => {
		const actor = createPersp();
		actor.send({ type: "SWITCH_PERSPECTIVE", perspectiveId: "persp-journey" });
		expect(actor.getSnapshot().value).toBe("active");
	});
});
