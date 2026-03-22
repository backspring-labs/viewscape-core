import { z } from "zod";

export const StoryRouteSchema = z.object({
	id: z.string(),
	title: z.string(),
	destinationObjective: z.string(),
	audienceTag: z.string().optional(),
	overview: z.string(),
	waypointIds: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).default({}),
});

export type StoryRoute = z.infer<typeof StoryRouteSchema>;
