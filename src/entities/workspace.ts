import { z } from "zod";

export const WorkspaceSchema = z.object({
	id: z.string(),
	name: z.string(),
	sourceIds: z.array(z.string()).default([]),
	indexId: z.string().optional(),
	createdAt: z.string().datetime(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
