import { z } from "zod";

export const IndexStatusSchema = z.enum(["building", "ready", "stale", "error"]);

export const TerrainIndexSchema = z.object({
	id: z.string(),
	sourceId: z.string(),
	version: z.string(),
	builtAt: z.string().datetime(),
	status: IndexStatusSchema,
	nodeCount: z.number().int().nonnegative(),
	edgeCount: z.number().int().nonnegative(),
});

export type IndexStatus = z.infer<typeof IndexStatusSchema>;
export type TerrainIndex = z.infer<typeof TerrainIndexSchema>;
