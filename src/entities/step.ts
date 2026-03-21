import { z } from "zod";
import { FocusTargetSchema } from "./focus-target.js";

export const StepSchema = z.object({
	id: z.string(),
	journeyId: z.string(),
	sequenceNumber: z.number().int().nonnegative(),
	focusTargets: z.array(FocusTargetSchema).default([]),
	capabilityId: z.string(),
	title: z.string(),
	narrative: z.string().optional(),
	actor: z.string().optional(),
	expectedAction: z.string().optional(),
	nextStepIds: z.array(z.string()).default([]),
	sceneId: z.string().optional(),
	evidenceRefIds: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
});

export type Step = z.infer<typeof StepSchema>;
