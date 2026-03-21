import { z } from "zod";

export const EvidenceRefTypeSchema = z.enum([
	"document",
	"screenshot",
	"api_spec",
	"code_ref",
	"design_spec",
	"control_evidence",
	"external_research",
]);

export const AccessClassificationSchema = z.enum(["public", "internal", "restricted"]);

export const EvidenceRefSchema = z.object({
	id: z.string(),
	title: z.string(),
	type: EvidenceRefTypeSchema,
	sourceUrl: z.string().optional(),
	summary: z.string().optional(),
	accessClassification: AccessClassificationSchema.default("internal"),
	relatedEntityIds: z.array(z.string()).default([]),
});

export type EvidenceRefType = z.infer<typeof EvidenceRefTypeSchema>;
export type AccessClassification = z.infer<typeof AccessClassificationSchema>;
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
