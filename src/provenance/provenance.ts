import { z } from "zod";

export const ProvenanceRefSchema = z.object({
	sourceId: z.string(),
	sourceFile: z.string().optional(),
	sourceSection: z.string().optional(),
	importJobId: z.string().optional(),
	importedAt: z.string().datetime().optional(),
	confidence: z.enum(["high", "medium", "low"]).default("high"),
});

export type ProvenanceRef = z.infer<typeof ProvenanceRefSchema>;
