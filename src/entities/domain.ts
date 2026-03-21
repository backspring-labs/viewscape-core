import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const DomainSchema = z.object({
	id: z.string(),
	label: z.string(),
	description: z.string().optional(),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Domain = z.infer<typeof DomainSchema>;
