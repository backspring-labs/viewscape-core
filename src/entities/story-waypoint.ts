import { z } from "zod";
import { FocusTargetSchema } from "./focus-target.js";

export const StoryWaypointSchema = z.object({
	id: z.string(),
	storyRouteId: z.string(),
	sequenceNumber: z.number().int().nonnegative(),
	title: z.string(),
	keyMessage: z.string(),
	whyItMatters: z.string().optional(),
	focusTargets: z.array(FocusTargetSchema).default([]),
	perspectiveId: z.string().optional(),
	evidenceRefIds: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
});

export type StoryWaypoint = z.infer<typeof StoryWaypointSchema>;
