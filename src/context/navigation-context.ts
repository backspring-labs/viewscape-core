import { z } from "zod";
import { FocusTargetSchema } from "../entities/focus-target.js";

const ViewportAnchorSchema = z.object({
	x: z.number(),
	y: z.number(),
	zoom: z.number().positive(),
});

export const NavigationContextSchema = z.object({
	activeDomainId: z.string().nullable(),
	activeCapabilityId: z.string().nullable(),
	activeJourneyId: z.string().nullable(),
	activeStepIndex: z.number().int().nullable(),
	activePerspectiveId: z.string(),
	activeFocusTargets: z.array(FocusTargetSchema),
	selectedNodeId: z.string().nullable(),
	selectedEdgeId: z.string().nullable(),
	viewportAnchor: ViewportAnchorSchema,
	activeSceneId: z.string().nullable(),
	mode: z.enum(["viewscape", "guiderail"]),
});

export type NavigationContext = z.infer<typeof NavigationContextSchema>;

export function createInitialNavigationContext(perspectiveId: string): NavigationContext {
	return {
		activeDomainId: null,
		activeCapabilityId: null,
		activeJourneyId: null,
		activeStepIndex: null,
		activePerspectiveId: perspectiveId,
		activeFocusTargets: [],
		selectedNodeId: null,
		selectedEdgeId: null,
		viewportAnchor: { x: 0, y: 0, zoom: 1 },
		activeSceneId: null,
		mode: "viewscape",
	};
}
