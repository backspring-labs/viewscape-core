import { z } from "zod";

export const ProviderAssociationTargetTypeSchema = z.enum([
	"domain",
	"capability",
	"value_stream",
	"journey",
	"process",
	"node",
]);

export const ProviderAssociationSchema = z.object({
	id: z.string(),
	providerId: z.string(),
	targetType: ProviderAssociationTargetTypeSchema,
	targetId: z.string(),
	role: z.string(),
	metadata: z.record(z.unknown()).default({}),
});

export type ProviderAssociationTargetType = z.infer<typeof ProviderAssociationTargetTypeSchema>;
export type ProviderAssociation = z.infer<typeof ProviderAssociationSchema>;
