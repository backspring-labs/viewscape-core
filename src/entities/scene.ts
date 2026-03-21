import { z } from "zod";

export const SceneSchema = z.object({
	id: z.string(),
	stepId: z.string(),
	uiStateRef: z.string().optional(),
	focusTargets: z.array(z.string()).default([]),
	instructionalCopy: z.string().optional(),
	annotations: z.array(z.string()).default([]),
});

export type Scene = z.infer<typeof SceneSchema>;
