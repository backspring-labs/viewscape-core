import { z } from "zod";
import type { EvidenceRef } from "../entities/evidence-ref.js";
import type { SourceAdapter } from "./source-adapter.js";

export const EntityManifestSchema = z.object({
	id: z.string(),
	type: z.string(),
	path: z.string(),
	label: z.string(),
	metadata: z.record(z.unknown()).default({}),
});

export const ResearchManifestSchema = z.object({
	id: z.string(),
	path: z.string(),
	title: z.string(),
	summary: z.string().optional(),
	tags: z.array(z.string()).default([]),
});

export type EntityManifest = z.infer<typeof EntityManifestSchema>;
export type ResearchManifest = z.infer<typeof ResearchManifestSchema>;

export interface ContentRepoAdapter extends SourceAdapter {
	type: "content_repo";

	listDomains(): Promise<EntityManifest[]>;
	listCapabilities(): Promise<EntityManifest[]>;
	listEntities(): Promise<EntityManifest[]>;
	listResearch(): Promise<ResearchManifest[]>;
	resolveLinks(entityId: string): Promise<EvidenceRef[]>;
}
