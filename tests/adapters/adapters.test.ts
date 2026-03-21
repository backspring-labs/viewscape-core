import { describe, expect, it } from "vitest";
import {
	CommitContextSchema,
	DiagramArtifactSchema,
	RouteDefinitionSchema,
	ServiceDefinitionSchema,
} from "../../src/adapters/code-repo-adapter.js";
import {
	EntityManifestSchema,
	ResearchManifestSchema,
} from "../../src/adapters/content-repo-adapter.js";
import {
	ArtifactContentSchema,
	ArtifactManifestSchema,
	SourceConnectionSchema,
} from "../../src/adapters/source-adapter.js";
import { MockContentRepoAdapter } from "../../src/test-fixtures/mock-content-adapter.js";

describe("Wire-format schemas", () => {
	it("validates SourceConnection", () => {
		const conn = SourceConnectionSchema.parse({
			sourceId: "s-1",
			uri: "/path/to/repo",
			connectedAt: "2026-01-01T00:00:00Z",
			revision: "abc123",
		});
		expect(conn.sourceId).toBe("s-1");
	});

	it("validates ArtifactManifest", () => {
		const manifest = ArtifactManifestSchema.parse({
			path: "domains/customer.yaml",
			type: "yaml",
			size: 256,
			lastModified: "2026-01-15T10:00:00Z",
		});
		expect(manifest.type).toBe("yaml");
	});

	it("validates ArtifactContent", () => {
		const content = ArtifactContentSchema.parse({
			path: "test.md",
			content: "# Hello",
			encoding: "utf-8",
		});
		expect(content.metadata).toEqual({});
	});

	it("rejects ArtifactManifest with invalid type", () => {
		expect(() =>
			ArtifactManifestSchema.parse({
				path: "test.txt",
				type: "invalid_type",
				size: 100,
				lastModified: "2026-01-01T00:00:00Z",
			}),
		).toThrow();
	});

	it("validates EntityManifest", () => {
		const entity = EntityManifestSchema.parse({
			id: "e-1",
			type: "domain",
			path: "domains/customer.yaml",
			label: "Customer",
		});
		expect(entity.id).toBe("e-1");
	});

	it("validates ResearchManifest", () => {
		const research = ResearchManifestSchema.parse({
			id: "r-1",
			path: "research/kyc.md",
			title: "KYC Policy",
		});
		expect(research.tags).toEqual([]);
	});

	it("validates RouteDefinition", () => {
		const route = RouteDefinitionSchema.parse({
			id: "rt-1",
			path: "/api/accounts",
			method: "POST",
			handler: "AccountController.create",
		});
		expect(route.method).toBe("POST");
	});

	it("validates ServiceDefinition", () => {
		const svc = ServiceDefinitionSchema.parse({
			id: "svc-1",
			name: "AccountService",
			path: "src/services/account.ts",
		});
		expect(svc.name).toBe("AccountService");
	});

	it("validates DiagramArtifact", () => {
		const diagram = DiagramArtifactSchema.parse({
			id: "diag-1",
			path: "docs/flows/login.mmd",
			format: "mermaid",
			content: "sequenceDiagram\n  A->>B: hello",
		});
		expect(diagram.format).toBe("mermaid");
	});

	it("validates CommitContext", () => {
		const commit = CommitContextSchema.parse({
			sha: "abc123def",
			message: "feat: add account opening",
			author: "jladd",
			timestamp: "2026-03-20T12:00:00Z",
		});
		expect(commit.filesChanged).toEqual([]);
	});
});

describe("MockContentRepoAdapter", () => {
	it("connects and returns valid connection", async () => {
		const adapter = new MockContentRepoAdapter();
		const conn = await adapter.connect("/mock/repo");
		expect(SourceConnectionSchema.parse(conn)).toBeDefined();
		expect(conn.sourceId).toBe("mock-source-1");
		expect(conn.revision).toBe("mock-rev-001");
	});

	it("lists artifacts with valid manifests", async () => {
		const adapter = new MockContentRepoAdapter();
		await adapter.connect("/mock/repo");
		const artifacts = await adapter.listArtifacts();
		expect(artifacts.length).toBeGreaterThan(0);
		for (const a of artifacts) {
			expect(ArtifactManifestSchema.parse(a)).toBeDefined();
		}
	});

	it("reads artifact and returns valid content", async () => {
		const adapter = new MockContentRepoAdapter();
		await adapter.connect("/mock/repo");
		const content = await adapter.readArtifact("domains/customer.yaml");
		expect(ArtifactContentSchema.parse(content)).toBeDefined();
		expect(content.encoding).toBe("utf-8");
	});

	it("returns revision", async () => {
		const adapter = new MockContentRepoAdapter();
		await adapter.connect("/mock/repo");
		const rev = await adapter.getRevision();
		expect(rev).toBe("mock-rev-001");
	});

	it("lists domains", async () => {
		const adapter = new MockContentRepoAdapter();
		const domains = await adapter.listDomains();
		expect(domains.length).toBe(3);
		for (const d of domains) {
			expect(EntityManifestSchema.parse(d)).toBeDefined();
		}
	});

	it("lists capabilities", async () => {
		const adapter = new MockContentRepoAdapter();
		const caps = await adapter.listCapabilities();
		expect(caps.length).toBe(6);
	});

	it("lists entities (nodes)", async () => {
		const adapter = new MockContentRepoAdapter();
		const entities = await adapter.listEntities();
		expect(entities.length).toBe(10);
	});

	it("lists research", async () => {
		const adapter = new MockContentRepoAdapter();
		const research = await adapter.listResearch();
		expect(research.length).toBeGreaterThan(0);
		for (const r of research) {
			expect(ResearchManifestSchema.parse(r)).toBeDefined();
		}
	});

	it("resolves links for entity with evidence", async () => {
		const adapter = new MockContentRepoAdapter();
		const links = await adapter.resolveLinks("n-identity-svc");
		expect(links.length).toBeGreaterThan(0);
	});

	it("returns empty links for entity without evidence", async () => {
		const adapter = new MockContentRepoAdapter();
		const links = await adapter.resolveLinks("nonexistent");
		expect(links).toEqual([]);
	});

	it("disconnects cleanly", async () => {
		const adapter = new MockContentRepoAdapter();
		await adapter.connect("/mock/repo");
		await adapter.disconnect();
		// No error thrown
	});
});
