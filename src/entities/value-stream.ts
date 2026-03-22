import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const ValueStreamSchema = z.object({
	id: z.string(),
	domainId: z.string(),
	label: z.string(),
	description: z.string().optional(),
	capabilityIds: z.array(z.string()).default([]),
	journeyIds: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type ValueStream = z.infer<typeof ValueStreamSchema>;
