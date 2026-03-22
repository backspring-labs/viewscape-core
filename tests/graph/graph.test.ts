import { describe, expect, it } from "vitest";
import {
	createGraph,
	filterNodes,
	getCapabilitiesForDomain,
	getEdge,
	getEdgesForNode,
	getNeighbors,
	getNode,
	getNodesForCapability,
	getNodesForLayer,
	getPathNodes,
	getProcessesForCapability,
	getProvidersForCapability,
	getProvidersForValueStream,
	getValueStreamsForDomain,
} from "../../src/graph/index.js";
import { bfsTraverse } from "../../src/graph/index.js";
import { filterGraph, filterNodesByTags, filterNodesByType } from "../../src/graph/index.js";
import {
	capabilities,
	edges,
	journeys,
	layers,
	nodes,
	processes,
	providerAssociations,
	steps,
	valueStreams,
} from "../../src/test-fixtures/index.js";

const graph = createGraph(nodes, edges);

describe("createGraph", () => {
	it("creates a graph with correct node count", () => {
		expect(graph.nodes.size).toBe(10);
	});

	it("creates a graph with correct edge count", () => {
		expect(graph.edges.size).toBe(11);
	});
});

describe("getNode / getEdge", () => {
	it("retrieves a node by id", () => {
		const node = getNode(graph, "n-customer");
		expect(node).toBeDefined();
		expect(node?.label).toBe("Customer");
	});

	it("returns undefined for missing node", () => {
		expect(getNode(graph, "nonexistent")).toBeUndefined();
	});

	it("retrieves an edge by id", () => {
		const edge = getEdge(graph, "e-cust-app");
		expect(edge).toBeDefined();
		expect(edge?.type).toBe("user_interaction");
	});
});

describe("getNeighbors", () => {
	it("returns outbound neighbors", () => {
		const neighbors = getNeighbors(graph, "n-api-gateway", "out");
		const ids = neighbors.map((n) => n.id);
		expect(ids).toContain("n-identity-svc");
		expect(ids).toContain("n-account-svc");
		expect(ids).toContain("n-payment-orch");
		expect(ids).not.toContain("n-mobile-app");
	});

	it("returns inbound neighbors", () => {
		const neighbors = getNeighbors(graph, "n-api-gateway", "in");
		const ids = neighbors.map((n) => n.id);
		expect(ids).toContain("n-mobile-app");
		expect(ids).not.toContain("n-identity-svc");
	});

	it("returns both directions by default", () => {
		const neighbors = getNeighbors(graph, "n-api-gateway");
		const ids = neighbors.map((n) => n.id);
		expect(ids).toContain("n-mobile-app");
		expect(ids).toContain("n-identity-svc");
	});
});

describe("getEdgesForNode", () => {
	it("returns outbound edges", () => {
		const result = getEdgesForNode(graph, "n-account-svc", "out");
		expect(result.length).toBe(2);
		const types = result.map((e) => e.type);
		expect(types).toContain("ledger_posting");
		expect(types).toContain("event");
	});

	it("returns inbound edges", () => {
		const result = getEdgesForNode(graph, "n-core-ledger", "in");
		expect(result.length).toBe(2);
	});
});

describe("filterNodes", () => {
	it("filters by type", () => {
		const services = filterNodes(graph, (n) => n.type === "service");
		expect(services.length).toBe(5);
	});

	it("filters by tag", () => {
		const coreNodes = filterNodes(graph, (n) => n.tags.includes("core"));
		expect(coreNodes.length).toBeGreaterThan(0);
	});
});

describe("getNodesForCapability", () => {
	it("returns correct nodes for onboarding capability", () => {
		const cap = capabilities.find((c) => c.id === "cap-onboarding");
		expect(cap).toBeDefined();
		if (!cap) return;

		const result = getNodesForCapability(graph, cap);
		const ids = result.map((n) => n.id);
		expect(ids).toContain("n-customer");
		expect(ids).toContain("n-identity-svc");
		expect(ids).toContain("n-risk-svc");
		expect(ids).not.toContain("n-core-ledger");
	});
});

describe("getCapabilitiesForDomain", () => {
	it("returns capabilities for Customer domain", () => {
		const result = getCapabilitiesForDomain("dom-customer", capabilities);
		expect(result.length).toBe(2);
		const labels = result.map((c) => c.label);
		expect(labels).toContain("Customer Onboarding");
		expect(labels).toContain("Authentication");
	});

	it("returns capabilities for Payments domain", () => {
		const result = getCapabilitiesForDomain("dom-payments", capabilities);
		expect(result.length).toBe(2);
	});

	it("returns empty for unknown domain", () => {
		expect(getCapabilitiesForDomain("dom-unknown", capabilities)).toEqual([]);
	});
});

describe("getNodesForLayer", () => {
	it("returns all nodes for layer with no type restrictions", () => {
		const defaultLayer = layers.find((l) => l.id === "layer-default");
		expect(defaultLayer).toBeDefined();
		if (!defaultLayer) return;

		const result = getNodesForLayer(graph, defaultLayer);
		expect(result.length).toBe(10);
	});

	it("filters by eligible types for process layer", () => {
		const processLayer = layers.find((l) => l.id === "layer-process");
		expect(processLayer).toBeDefined();
		if (!processLayer) return;

		const result = getNodesForLayer(graph, processLayer);
		for (const node of result) {
			expect(["service", "system"]).toContain(node.type);
		}
	});
});

describe("getPathNodes", () => {
	it("returns ordered nodes along the journey", () => {
		const journey = journeys[0];
		expect(journey).toBeDefined();
		if (!journey) return;

		const result = getPathNodes(graph, journey, steps);
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]?.id).toBe("n-customer");
	});
});

describe("bfsTraverse", () => {
	it("traverses from customer outward", () => {
		const result = bfsTraverse(graph, "n-customer", { direction: "out", maxDepth: 2 });
		const ids = result.map((n) => n.id);
		expect(ids).toContain("n-customer");
		expect(ids).toContain("n-mobile-app");
		expect(ids).toContain("n-api-gateway");
	});

	it("respects depth limit", () => {
		const depth1 = bfsTraverse(graph, "n-customer", { direction: "out", maxDepth: 1 });
		const depth2 = bfsTraverse(graph, "n-customer", { direction: "out", maxDepth: 2 });
		expect(depth2.length).toBeGreaterThanOrEqual(depth1.length);
	});
});

describe("filterGraph", () => {
	it("returns filtered graph with consistent edges", () => {
		const filtered = filterGraph(graph, (n) => n.type === "service");
		for (const edge of filtered.edges.values()) {
			expect(filtered.nodes.has(edge.sourceNodeId)).toBe(true);
			expect(filtered.nodes.has(edge.targetNodeId)).toBe(true);
		}
	});
});

describe("filterNodesByTags", () => {
	it("finds nodes with security tag", () => {
		const result = filterNodesByTags(graph, ["security"]);
		expect(result.some((n) => n.id === "n-identity-svc")).toBe(true);
	});
});

describe("filterNodesByType", () => {
	it("finds actor nodes", () => {
		const result = filterNodesByType(graph, ["actor"]);
		expect(result.length).toBe(1);
		expect(result[0]?.id).toBe("n-customer");
	});
});

describe("getProvidersForCapability", () => {
	it("returns providers for payment processing", () => {
		const result = getProvidersForCapability("cap-payment-processing", providerAssociations);
		expect(result).toContain("prov-visa");
		expect(result).toContain("prov-mastercard");
	});

	it("returns providers for money movement", () => {
		const result = getProvidersForCapability("cap-money-movement", providerAssociations);
		expect(result).toContain("prov-rtp");
		expect(result).toContain("prov-fednow");
	});

	it("returns empty for capability with no providers", () => {
		const result = getProvidersForCapability("cap-account-servicing", providerAssociations);
		expect(result).toEqual([]);
	});

	it("deduplicates provider IDs", () => {
		const result = getProvidersForCapability("cap-payment-processing", providerAssociations);
		expect(new Set(result).size).toBe(result.length);
	});
});

describe("getProvidersForValueStream", () => {
	it("returns providers for retail payments value stream", () => {
		const result = getProvidersForValueStream("vs-retail-payments", providerAssociations);
		expect(result).toContain("prov-rtp");
		expect(result).toContain("prov-fednow");
	});

	it("returns empty for unknown value stream", () => {
		const result = getProvidersForValueStream("vs-nonexistent", providerAssociations);
		expect(result).toEqual([]);
	});
});

describe("getValueStreamsForDomain", () => {
	it("returns value streams for payments domain", () => {
		const result = getValueStreamsForDomain("dom-payments", valueStreams);
		expect(result.length).toBe(1);
		expect(result[0]?.label).toBe("Retail Payments");
	});

	it("returns value streams for accounts domain", () => {
		const result = getValueStreamsForDomain("dom-accounts", valueStreams);
		expect(result.length).toBe(1);
		expect(result[0]?.label).toBe("Account Origination");
	});

	it("returns empty for domain with no value streams", () => {
		const result = getValueStreamsForDomain("dom-customer", valueStreams);
		expect(result).toEqual([]);
	});
});

describe("getProcessesForCapability", () => {
	it("returns processes for payment processing capability", () => {
		const result = getProcessesForCapability("cap-payment-processing", processes);
		expect(result.length).toBe(1);
		expect(result[0]?.label).toBe("Payment Authorization");
	});

	it("returns empty for capability with no processes", () => {
		const result = getProcessesForCapability("cap-auth", processes);
		expect(result).toEqual([]);
	});
});
