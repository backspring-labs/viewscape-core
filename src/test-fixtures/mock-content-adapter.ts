import type {
	ContentRepoAdapter,
	EntityManifest,
	ResearchManifest,
} from "../adapters/content-repo-adapter.js";
import type {
	ArtifactContent,
	ArtifactFilter,
	ArtifactManifest,
	SourceConnection,
} from "../adapters/source-adapter.js";
import type { EvidenceRef } from "../entities/evidence-ref.js";
import { capabilities, domains, edges, evidenceRefs, nodes } from "./seed-banking.js";

export class MockContentRepoAdapter implements ContentRepoAdapter {
	readonly type = "content_repo" as const;

	private connected = false;
	private connectionUri = "";

	async connect(uri: string): Promise<SourceConnection> {
		this.connected = true;
		this.connectionUri = uri;
		return {
			sourceId: "mock-source-1",
			uri,
			connectedAt: new Date().toISOString(),
			revision: "mock-rev-001",
		};
	}

	async disconnect(): Promise<void> {
		this.connected = false;
		this.connectionUri = "";
	}

	async listArtifacts(_filter?: ArtifactFilter): Promise<ArtifactManifest[]> {
		return [
			{
				path: "domains/customer.yaml",
				type: "yaml",
				size: 256,
				lastModified: "2026-01-15T10:00:00Z",
			},
			{
				path: "domains/accounts.yaml",
				type: "yaml",
				size: 312,
				lastModified: "2026-01-15T10:00:00Z",
			},
			{
				path: "domains/payments.yaml",
				type: "yaml",
				size: 298,
				lastModified: "2026-01-15T10:00:00Z",
			},
			{
				path: "research/kyc-policy.md",
				type: "markdown",
				size: 1024,
				lastModified: "2026-01-10T08:00:00Z",
			},
		];
	}

	async readArtifact(path: string): Promise<ArtifactContent> {
		return {
			path,
			content: `Mock content for ${path}`,
			encoding: "utf-8",
			metadata: {},
		};
	}

	async getRevision(): Promise<string> {
		return "mock-rev-001";
	}

	async listDomains(): Promise<EntityManifest[]> {
		return domains.map((d) => ({
			id: d.id,
			type: "domain",
			path: `domains/${d.label.toLowerCase()}.yaml`,
			label: d.label,
		}));
	}

	async listCapabilities(): Promise<EntityManifest[]> {
		return capabilities.map((c) => ({
			id: c.id,
			type: "capability",
			path: `capabilities/${c.id}.yaml`,
			label: c.label,
		}));
	}

	async listEntities(): Promise<EntityManifest[]> {
		return nodes.map((n) => ({
			id: n.id,
			type: n.type,
			path: `entities/${n.id}.yaml`,
			label: n.label,
		}));
	}

	async listResearch(): Promise<ResearchManifest[]> {
		return [
			{
				id: "research-kyc",
				path: "research/kyc-policy.md",
				title: "KYC Policy Requirements",
				summary: "Regulatory requirements for customer identity verification.",
				tags: ["kyc", "compliance"],
			},
		];
	}

	async resolveLinks(entityId: string): Promise<EvidenceRef[]> {
		return evidenceRefs.filter((e) => e.relatedEntityIds.includes(entityId));
	}
}
