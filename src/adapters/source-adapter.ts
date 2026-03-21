import { z } from "zod";

export const ArtifactTypeSchema = z.enum(["markdown", "yaml", "json", "mermaid", "code", "other"]);

export const ArtifactManifestSchema = z.object({
	path: z.string(),
	type: ArtifactTypeSchema,
	size: z.number().int().nonnegative(),
	lastModified: z.string().datetime(),
});

export const ArtifactContentSchema = z.object({
	path: z.string(),
	content: z.string(),
	encoding: z.literal("utf-8"),
	metadata: z.record(z.unknown()).default({}),
});

export const SourceConnectionSchema = z.object({
	sourceId: z.string(),
	uri: z.string(),
	connectedAt: z.string().datetime(),
	revision: z.string(),
});

export const ArtifactFilterSchema = z.object({
	types: z.array(ArtifactTypeSchema).optional(),
	pathPrefix: z.string().optional(),
	modifiedAfter: z.string().datetime().optional(),
});

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;
export type ArtifactManifest = z.infer<typeof ArtifactManifestSchema>;
export type ArtifactContent = z.infer<typeof ArtifactContentSchema>;
export type SourceConnection = z.infer<typeof SourceConnectionSchema>;
export type ArtifactFilter = z.infer<typeof ArtifactFilterSchema>;

export interface SourceAdapter {
	readonly type: "content_repo" | "code_repo";

	connect(uri: string): Promise<SourceConnection>;
	disconnect(): Promise<void>;

	listArtifacts(filter?: ArtifactFilter): Promise<ArtifactManifest[]>;
	readArtifact(path: string): Promise<ArtifactContent>;
	getRevision(): Promise<string>;
}
