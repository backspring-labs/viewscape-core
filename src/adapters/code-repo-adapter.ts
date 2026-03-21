import { z } from "zod";
import type { SourceAdapter } from "./source-adapter.js";

export const RouteDefinitionSchema = z.object({
	id: z.string(),
	path: z.string(),
	method: z.string().optional(),
	handler: z.string().optional(),
	metadata: z.record(z.unknown()).default({}),
});

export const ServiceDefinitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	path: z.string(),
	type: z.string().optional(),
	metadata: z.record(z.unknown()).default({}),
});

export const DiagramArtifactSchema = z.object({
	id: z.string(),
	path: z.string(),
	format: z.enum(["mermaid", "d2", "other"]),
	content: z.string(),
});

export const CommitContextSchema = z.object({
	sha: z.string(),
	message: z.string(),
	author: z.string(),
	timestamp: z.string().datetime(),
	filesChanged: z.array(z.string()).default([]),
});

export type RouteDefinition = z.infer<typeof RouteDefinitionSchema>;
export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema>;
export type DiagramArtifact = z.infer<typeof DiagramArtifactSchema>;
export type CommitContext = z.infer<typeof CommitContextSchema>;

export interface CodeRepoAdapter extends SourceAdapter {
	type: "code_repo";

	listRoutes(): Promise<RouteDefinition[]>;
	listServices(): Promise<ServiceDefinition[]>;
	readDiagramArtifacts(): Promise<DiagramArtifact[]>;
	getCommitContext(commitSha: string): Promise<CommitContext>;
}
