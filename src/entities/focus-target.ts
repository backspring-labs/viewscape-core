import { z } from "zod";

export const FocusTargetTypeSchema = z.enum([
	"node",
	"edge",
	"scene_element",
	"annotation",
	"artifact_anchor",
	"sequence_element",
]);

export const FocusTargetSchema = z.object({
	type: FocusTargetTypeSchema,
	targetId: z.string(),
});

export type FocusTargetType = z.infer<typeof FocusTargetTypeSchema>;
export type FocusTarget = z.infer<typeof FocusTargetSchema>;
