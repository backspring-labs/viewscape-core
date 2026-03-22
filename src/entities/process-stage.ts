import { z } from "zod";

export const ProcessStageSchema = z.object({
	id: z.string(),
	processId: z.string(),
	sequenceNumber: z.number().int().nonnegative(),
	label: z.string(),
	description: z.string().optional(),
	nodeIds: z.array(z.string()).default([]),
	edgeIds: z.array(z.string()).default([]),
	controlPoints: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
});

export type ProcessStage = z.infer<typeof ProcessStageSchema>;
