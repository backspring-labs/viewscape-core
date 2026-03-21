import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

export const JourneySchema = z.object({
	id: z.string(),
	label: z.string(),
	description: z.string().optional(),
	entryCapabilityId: z.string(),
	capabilityIds: z.array(z.string()).default([]),
	stepIds: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	entryConditions: z.array(z.string()).default([]),
	exitConditions: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Journey = z.infer<typeof JourneySchema>;
