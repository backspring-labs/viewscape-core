import { describe, expect, it } from "vitest";
import {
	IndexBuildResultSchema,
	IndexStatsSchema,
	ValidationResultSchema,
} from "../../src/indexing/indexer.js";

describe("Indexing wire-format schemas", () => {
	it("validates IndexBuildResult", () => {
		const result = IndexBuildResultSchema.parse({
			indexId: "idx-1",
			nodeCount: 10,
			edgeCount: 11,
			journeyCount: 1,
			provenanceEntries: 25,
			builtAt: "2026-03-20T12:00:00Z",
			duration: 1500,
		});
		expect(result.indexId).toBe("idx-1");
		expect(result.duration).toBe(1500);
	});

	it("rejects IndexBuildResult with negative counts", () => {
		expect(() =>
			IndexBuildResultSchema.parse({
				indexId: "idx-1",
				nodeCount: -1,
				edgeCount: 0,
				journeyCount: 0,
				provenanceEntries: 0,
				builtAt: "2026-03-20T12:00:00Z",
				duration: 100,
			}),
		).toThrow();
	});

	it("validates ValidationResult", () => {
		const result = ValidationResultSchema.parse({
			valid: true,
		});
		expect(result.errors).toEqual([]);
		expect(result.warnings).toEqual([]);
	});

	it("validates ValidationResult with errors", () => {
		const result = ValidationResultSchema.parse({
			valid: false,
			errors: ["Missing required field: domainId"],
			warnings: ["Deprecated field used"],
		});
		expect(result.valid).toBe(false);
		expect(result.errors.length).toBe(1);
	});

	it("validates IndexStats", () => {
		const stats = IndexStatsSchema.parse({
			indexId: "idx-1",
			nodeCount: 10,
			edgeCount: 11,
			journeyCount: 1,
			domainCount: 3,
			capabilityCount: 6,
			lastBuiltAt: "2026-03-20T12:00:00Z",
		});
		expect(stats.domainCount).toBe(3);
		expect(stats.capabilityCount).toBe(6);
	});
});
