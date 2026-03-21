import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { sourceMachine } from "../../src/machines/source.machine.js";

function createSource() {
	return createActor(sourceMachine).start();
}

describe("Source Machine", () => {
	it("starts in detached with null context", () => {
		const actor = createSource();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("detached");
		expect(snap.context.sourceId).toBeNull();
		expect(snap.context.sourceType).toBeNull();
		expect(snap.context.attachedAt).toBeNull();
	});

	it("ATTACH_SOURCE transitions to attaching", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "content_repo" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("attaching");
		expect(snap.context.sourceId).toBe("s-1");
		expect(snap.context.sourceType).toBe("content_repo");
	});

	it("SOURCE_ATTACHED transitions to attached", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "content_repo" });
		actor.send({ type: "SOURCE_ATTACHED", attachedAt: "2026-01-01T00:00:00Z" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("attached");
		expect(snap.context.attachedAt).toBe("2026-01-01T00:00:00Z");
	});

	it("ATTACH_FAILED returns to detached and clears context", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "code_repo" });
		actor.send({ type: "ATTACH_FAILED", error: "Connection refused" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("detached");
		expect(snap.context.sourceId).toBeNull();
		expect(snap.context.sourceType).toBeNull();
	});

	it("DETACH_SOURCE transitions to detaching", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "content_repo" });
		actor.send({ type: "SOURCE_ATTACHED", attachedAt: "2026-01-01T00:00:00Z" });
		actor.send({ type: "DETACH_SOURCE" });
		expect(actor.getSnapshot().value).toBe("detaching");
	});

	it("SOURCE_DETACHED returns to detached and clears context", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "content_repo" });
		actor.send({ type: "SOURCE_ATTACHED", attachedAt: "2026-01-01T00:00:00Z" });
		actor.send({ type: "DETACH_SOURCE" });
		actor.send({ type: "SOURCE_DETACHED" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("detached");
		expect(snap.context.sourceId).toBeNull();
	});

	it("full lifecycle: attach → detach", () => {
		const actor = createSource();
		actor.send({ type: "ATTACH_SOURCE", sourceId: "s-1", sourceType: "code_repo" });
		actor.send({ type: "SOURCE_ATTACHED", attachedAt: "2026-03-20T12:00:00Z" });
		expect(actor.getSnapshot().value).toBe("attached");
		actor.send({ type: "DETACH_SOURCE" });
		actor.send({ type: "SOURCE_DETACHED" });
		expect(actor.getSnapshot().value).toBe("detached");
	});
});
