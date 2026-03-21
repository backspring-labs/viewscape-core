import { z } from "zod";
import type { ArtifactManifest, SourceConnection } from "../adapters/source-adapter.js";

export const IndexBuildResultSchema = z.object({
	indexId: z.string(),
	nodeCount: z.number().int().nonnegative(),
	edgeCount: z.number().int().nonnegative(),
	journeyCount: z.number().int().nonnegative(),
	provenanceEntries: z.number().int().nonnegative(),
	builtAt: z.string().datetime(),
	duration: z.number().nonnegative(),
});

export const ValidationResultSchema = z.object({
	valid: z.boolean(),
	errors: z.array(z.string()).default([]),
	warnings: z.array(z.string()).default([]),
});

export const IndexStatsSchema = z.object({
	indexId: z.string(),
	nodeCount: z.number().int().nonnegative(),
	edgeCount: z.number().int().nonnegative(),
	journeyCount: z.number().int().nonnegative(),
	domainCount: z.number().int().nonnegative(),
	capabilityCount: z.number().int().nonnegative(),
	lastBuiltAt: z.string().datetime(),
});

export type IndexBuildResult = z.infer<typeof IndexBuildResultSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type IndexStats = z.infer<typeof IndexStatsSchema>;

export interface Indexer {
	buildIndex(source: SourceConnection, artifacts: ArtifactManifest[]): Promise<IndexBuildResult>;
	validateIndex(indexId: string): Promise<ValidationResult>;
	getIndexStats(indexId: string): Promise<IndexStats>;
}
