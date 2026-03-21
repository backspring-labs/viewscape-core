import { z } from "zod";
import { ProvenanceRefSchema } from "../provenance/provenance.js";

const PositionSchema = z.object({
	x: z.number(),
	y: z.number(),
});

export const NodeSchema = z.object({
	id: z.string(),
	type: z.string(),
	label: z.string(),
	description: z.string().optional(),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
	layoutByPerspective: z.record(PositionSchema).default({}),
	provenance: ProvenanceRefSchema.optional(),
});

export type Node = z.infer<typeof NodeSchema>;
