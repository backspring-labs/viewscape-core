import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const ProviderSchema = z.object({
	id: z.string(),
	label: z.string(),
	description: z.string().optional(),
	category: z.string(),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Provider = z.infer<typeof ProviderSchema>;
