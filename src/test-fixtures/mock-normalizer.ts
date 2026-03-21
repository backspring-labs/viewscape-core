import type { Capability } from "../entities/capability.js";
import type { Domain } from "../entities/domain.js";
import type { Edge } from "../entities/edge.js";
import {
	CapabilitySchema,
	DomainSchema,
	EdgeSchema,
	JourneySchema,
	NodeSchema,
} from "../entities/index.js";
import type { Journey } from "../entities/journey.js";
import type { Node } from "../entities/node.js";
import type { Normalizer } from "../indexing/normalizer.js";
import type { ProvenanceRef } from "../provenance/provenance.js";

/**
 * A concrete normalizer that validates raw data against Zod schemas.
 * Used in test fixtures to prove the full pipeline.
 */
export class MockNormalizer implements Normalizer {
	private sourceId: string;

	constructor(sourceId: string) {
		this.sourceId = sourceId;
	}

	normalizeDomains(raw: unknown[]): Domain[] {
		return raw.map((r) => DomainSchema.parse(r));
	}

	normalizeCapabilities(raw: unknown[]): Capability[] {
		return raw.map((r) => CapabilitySchema.parse(r));
	}

	normalizeNodes(raw: unknown[]): Node[] {
		return raw.map((r) => NodeSchema.parse(r));
	}

	normalizeEdges(raw: unknown[]): Edge[] {
		return raw.map((r) => EdgeSchema.parse(r));
	}

	normalizeJourneys(raw: unknown[]): Journey[] {
		return raw.map((r) => JourneySchema.parse(r));
	}

	resolveProvenance(entity: { id: string }, sourceFile: string, section?: string): ProvenanceRef {
		return {
			sourceId: this.sourceId,
			sourceFile,
			sourceSection: section,
			confidence: "high",
		};
	}
}
