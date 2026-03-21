import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { indexGenerationMachine } from "../../src/machines/index-generation.machine.js";

function createIndexGen() {
	return createActor(indexGenerationMachine).start();
}

describe("Index Generation Machine", () => {
	it("starts in idle", () => {
		const actor = createIndexGen();
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.indexId).toBeNull();
		expect(snap.context.sourceId).toBeNull();
		expect(snap.context.progress).toBe(0);
		expect(snap.context.error).toBeNull();
	});

	it("START_INDEX transitions to generating", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("generating");
		expect(snap.context.sourceId).toBe("s-1");
		expect(snap.context.progress).toBe(0);
	});

	it("INDEX_PROGRESS updates progress", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_PROGRESS", progress: 50 });
		expect(actor.getSnapshot().context.progress).toBe(50);
		actor.send({ type: "INDEX_PROGRESS", progress: 75 });
		expect(actor.getSnapshot().context.progress).toBe(75);
	});

	it("INDEX_COMPLETE transitions to ready", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_COMPLETE", indexId: "idx-1" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("ready");
		expect(snap.context.indexId).toBe("idx-1");
		expect(snap.context.progress).toBe(100);
	});

	it("INDEX_FAILED transitions to error", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_FAILED", error: "Parse error" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("error");
		expect(snap.context.error).toBe("Parse error");
		expect(snap.context.progress).toBe(0);
	});

	it("REBUILD_INDEX from ready goes back to generating", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_COMPLETE", indexId: "idx-1" });
		actor.send({ type: "REBUILD_INDEX" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("generating");
		expect(snap.context.indexId).toBeNull();
		expect(snap.context.progress).toBe(0);
		expect(snap.context.sourceId).toBe("s-1");
	});

	it("INVALIDATE_INDEX from ready returns to idle", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_COMPLETE", indexId: "idx-1" });
		actor.send({ type: "INVALIDATE_INDEX" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.indexId).toBeNull();
	});

	it("START_INDEX from error retries", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_FAILED", error: "timeout" });
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("generating");
		expect(snap.context.error).toBeNull();
	});

	it("INVALIDATE_INDEX from error returns to idle and clears all", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_FAILED", error: "timeout" });
		actor.send({ type: "INVALIDATE_INDEX" });
		const snap = actor.getSnapshot();
		expect(snap.value).toBe("idle");
		expect(snap.context.sourceId).toBeNull();
		expect(snap.context.error).toBeNull();
	});

	it("full lifecycle: start → progress → complete → rebuild → complete", () => {
		const actor = createIndexGen();
		actor.send({ type: "START_INDEX", sourceId: "s-1" });
		actor.send({ type: "INDEX_PROGRESS", progress: 25 });
		actor.send({ type: "INDEX_PROGRESS", progress: 50 });
		actor.send({ type: "INDEX_PROGRESS", progress: 100 });
		actor.send({ type: "INDEX_COMPLETE", indexId: "idx-1" });
		expect(actor.getSnapshot().value).toBe("ready");

		actor.send({ type: "REBUILD_INDEX" });
		expect(actor.getSnapshot().value).toBe("generating");

		actor.send({ type: "INDEX_COMPLETE", indexId: "idx-2" });
		expect(actor.getSnapshot().value).toBe("ready");
		expect(actor.getSnapshot().context.indexId).toBe("idx-2");
	});
});
