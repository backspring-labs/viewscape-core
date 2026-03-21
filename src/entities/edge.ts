import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const EdgeSchema = z.object({
	id: z.string(),
	sourceNodeId: z.string(),
	targetNodeId: z.string(),
	type: z.string(),
	label: z.string().optional(),
	directed: z.boolean().default(true),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Edge = z.infer<typeof EdgeSchema>;
