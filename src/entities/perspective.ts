import { z } from "zod";

export const PerspectiveTypeSchema = z.enum([
	"overview",
	"architecture",
	"provider",
	"process",
	"journey",
	"sequence",
	"control",
]);

export const PerspectiveSchema = z.object({
	id: z.string(),
	type: PerspectiveTypeSchema,
	label: z.string(),
	description: z.string().optional(),
	highlightRules: z.record(z.unknown()).default({}),
	visibilityRules: z.record(z.unknown()).default({}),
	defaultLayerId: z.string().optional(),
});

export type PerspectiveType = z.infer<typeof PerspectiveTypeSchema>;
export type Perspective = z.infer<typeof PerspectiveSchema>;
