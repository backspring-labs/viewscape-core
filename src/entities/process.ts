import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const ProcessSchema = z.object({
	id: z.string(),
	label: z.string(),
	description: z.string().optional(),
	capabilityIds: z.array(z.string()).default([]),
	valueStreamId: z.string().optional(),
	sourceDocRef: ProvenanceRefSchema.optional(),
	stageIds: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Process = z.infer<typeof ProcessSchema>;
