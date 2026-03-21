import type { Capability } from "../entities/capability.js";
import type { Domain } from "../entities/domain.js";
import type { Edge } from "../entities/edge.js";
import type { Journey } from "../entities/journey.js";
import type { Node } from "../entities/node.js";
import type { ProvenanceRef } from "../provenance/provenance.js";

export interface Normalizer {
	normalizeDomains(raw: unknown[]): Domain[];
	normalizeCapabilities(raw: unknown[]): Capability[];
	normalizeNodes(raw: unknown[]): Node[];
	normalizeEdges(raw: unknown[]): Edge[];
	normalizeJourneys(raw: unknown[]): Journey[];
	resolveProvenance(entity: { id: string }, sourceFile: string, section?: string): ProvenanceRef;
}
