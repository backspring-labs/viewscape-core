import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const CapabilitySchema = z.object({
	id: z.string(),
	domainId: z.string(),
	label: z.string(),
	description: z.string().optional(),
	nodeIds: z.array(z.string()).default([]),
	edgeIds: z.array(z.string()).default([]),
	journeyIds: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Capability = z.infer<typeof CapabilitySchema>;
