import { z } from "zod";

export const AnnotationTargetTypeSchema = z.enum([
	"domain",
	"capability",
	"node",
	"edge",
	"step",
	"journey",
]);

export const AnnotationTypeSchema = z.enum([
	"research_note",
	"risk_note",
	"control_note",
	"commentary",
	"vendor_observation",
	"design_rationale",
	"implementation_note",
]);

export const AnnotationSchema = z.object({
	id: z.string(),
	targetType: AnnotationTargetTypeSchema,
	targetId: z.string(),
	type: AnnotationTypeSchema,
	content: z.string(),
	author: z.string().optional(),
	createdAt: z.string().datetime(),
});

export type AnnotationTargetType = z.infer<typeof AnnotationTargetTypeSchema>;
export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;
export type Annotation = z.infer<typeof AnnotationSchema>;
