import type { IndexBuildResult } from "./indexer.js";

export interface RebuildOrchestrator {
	/**
	 * Trigger a full rebuild of the index from the attached source.
	 */
	rebuild(sourceId: string): Promise<IndexBuildResult>;

	/**
	 * Trigger an incremental update based on changes since the last build.
	 */
	incrementalUpdate(sourceId: string, sinceRevision: string): Promise<IndexBuildResult>;

	/**
	 * Check whether a rebuild is needed based on source changes.
	 */
	isStale(sourceId: string): Promise<boolean>;
}
