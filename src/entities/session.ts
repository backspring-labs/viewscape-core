import { z } from "zod";
import { FocusTargetSchema } from "./focus-target.js";

const ViewportAnchorSchema = z.object({
	x: z.number(),
	y: z.number(),
	zoom: z.number().positive(),
});

export const SessionSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),
	activeDomainId: z.string().nullable().default(null),
	activeCapabilityId: z.string().nullable().default(null),
	activeJourneyId: z.string().nullable().default(null),
	activeStepId: z.string().nullable().default(null),
	activePerspectiveId: z.string(),
	activeFocusTargets: z.array(FocusTargetSchema).default([]),
	selectedNodeId: z.string().nullable().default(null),
	selectedEdgeId: z.string().nullable().default(null),
	viewportAnchor: ViewportAnchorSchema.default({ x: 0, y: 0, zoom: 1 }),
	filters: z.record(z.unknown()).default({}),
});

export type ViewportAnchor = z.infer<typeof ViewportAnchorSchema>;
export type Session = z.infer<typeof SessionSchema>;
