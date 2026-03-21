import { AnnotationSchema } from "../entities/annotation.js";
import type { Annotation } from "../entities/annotation.js";
import { CapabilitySchema } from "../entities/capability.js";
import type { Capability } from "../entities/capability.js";
import { DomainSchema } from "../entities/domain.js";
import type { Domain } from "../entities/domain.js";
import { EdgeSchema } from "../entities/edge.js";
import type { Edge } from "../entities/edge.js";
import { EvidenceRefSchema } from "../entities/evidence-ref.js";
import type { EvidenceRef } from "../entities/evidence-ref.js";
import { JourneySchema } from "../entities/journey.js";
import type { Journey } from "../entities/journey.js";
import { LayerSchema } from "../entities/layer.js";
import type { Layer } from "../entities/layer.js";
import { NodeSchema } from "../entities/node.js";
import type { Node } from "../entities/node.js";
import { PerspectiveSchema } from "../entities/perspective.js";
import type { Perspective } from "../entities/perspective.js";
import { SceneSchema } from "../entities/scene.js";
import type { Scene } from "../entities/scene.js";
import { StepSchema } from "../entities/step.js";
import type { Step } from "../entities/step.js";

// --- Domains ---

export const domains: Domain[] = [
	{
		id: "dom-customer",
		label: "Customer",
		description: "Customer-facing capabilities",
		tags: ["retail"],
	},
	{
		id: "dom-accounts",
		label: "Accounts",
		description: "Account lifecycle and servicing",
		tags: ["core"],
	},
	{
		id: "dom-payments",
		label: "Payments",
		description: "Payment processing and money movement",
		tags: ["core"],
	},
].map((d) => DomainSchema.parse(d));

// --- Capabilities ---

export const capabilities: Capability[] = [
	{
		id: "cap-onboarding",
		domainId: "dom-customer",
		label: "Customer Onboarding",
		description: "New customer identity verification and profile creation",
		nodeIds: ["n-customer", "n-mobile-app", "n-api-gateway", "n-identity-svc", "n-risk-svc"],
		edgeIds: ["e-cust-app", "e-app-gw", "e-gw-identity", "e-identity-risk"],
		journeyIds: ["j-open-savings"],
		tags: ["kyc", "onboarding"],
	},
	{
		id: "cap-auth",
		domainId: "dom-customer",
		label: "Authentication",
		description: "User authentication and session management",
		nodeIds: ["n-customer", "n-mobile-app", "n-api-gateway", "n-identity-svc"],
		edgeIds: ["e-cust-app", "e-app-gw", "e-gw-identity"],
		journeyIds: [],
		tags: ["auth", "security"],
	},
	{
		id: "cap-account-opening",
		domainId: "dom-accounts",
		label: "Account Opening",
		description: "New account creation and ledger setup",
		nodeIds: ["n-api-gateway", "n-account-svc", "n-core-ledger", "n-notification-svc"],
		edgeIds: ["e-gw-account", "e-account-ledger", "e-account-notify"],
		journeyIds: ["j-open-savings"],
		tags: ["accounts", "origination"],
	},
	{
		id: "cap-account-servicing",
		domainId: "dom-accounts",
		label: "Account Servicing",
		description: "Ongoing account management and maintenance",
		nodeIds: ["n-account-svc", "n-core-ledger", "n-notification-svc"],
		edgeIds: ["e-account-ledger", "e-account-notify"],
		journeyIds: [],
		tags: ["accounts", "servicing"],
	},
	{
		id: "cap-money-movement",
		domainId: "dom-payments",
		label: "Money Movement",
		description: "Internal and external fund transfers",
		nodeIds: ["n-api-gateway", "n-payment-orch", "n-payment-rail", "n-core-ledger"],
		edgeIds: ["e-gw-payment", "e-payment-rail", "e-payment-ledger"],
		journeyIds: [],
		tags: ["payments", "transfers"],
	},
	{
		id: "cap-payment-processing",
		domainId: "dom-payments",
		label: "Payment Processing",
		description: "Payment authorization, clearing, and settlement",
		nodeIds: ["n-payment-orch", "n-payment-rail", "n-risk-svc", "n-core-ledger"],
		edgeIds: ["e-payment-rail", "e-payment-ledger", "e-risk-payment"],
		journeyIds: [],
		tags: ["payments", "processing"],
	},
].map((d) => CapabilitySchema.parse(d));

// --- Nodes ---

export const nodes: Node[] = [
	{
		id: "n-customer",
		type: "actor",
		label: "Customer",
		description: "Retail banking customer",
		tags: ["external"],
		layoutByPerspective: {
			"persp-overview": { x: 0, y: 200 },
			"persp-architecture": { x: 0, y: 200 },
			"persp-process": { x: 0, y: 0 },
			"persp-journey": { x: 0, y: 0 },
			"persp-provider": { x: 0, y: 200 },
		},
	},
	{
		id: "n-mobile-app",
		type: "screen",
		label: "Mobile Banking App",
		description: "Customer-facing mobile application",
		tags: ["channel", "mobile"],
		layoutByPerspective: {
			"persp-overview": { x: 300, y: 200 },
			"persp-architecture": { x: 300, y: 200 },
			"persp-process": { x: 300, y: 0 },
			"persp-journey": { x: 300, y: 0 },
			"persp-provider": { x: 300, y: 200 },
		},
	},
	{
		id: "n-api-gateway",
		type: "system",
		label: "API Gateway",
		description: "Central API gateway and routing layer",
		tags: ["infrastructure", "orchestration"],
		layoutByPerspective: {
			"persp-overview": { x: 600, y: 200 },
			"persp-architecture": { x: 600, y: 200 },
			"persp-process": { x: 600, y: 0 },
			"persp-journey": { x: 600, y: 0 },
			"persp-provider": { x: 600, y: 200 },
		},
	},
	{
		id: "n-identity-svc",
		type: "service",
		label: "Identity Service",
		description: "Identity verification and KYC processing",
		tags: ["identity", "kyc", "security"],
		layoutByPerspective: {
			"persp-overview": { x: 950, y: 0 },
			"persp-architecture": { x: 950, y: 0 },
			"persp-process": { x: 0, y: 150 },
			"persp-journey": { x: 0, y: 150 },
			"persp-provider": { x: 950, y: 0 },
		},
	},
	{
		id: "n-risk-svc",
		type: "service",
		label: "Risk & Decisioning",
		description: "Fraud detection, risk scoring, and policy evaluation",
		tags: ["risk", "fraud", "decisioning"],
		layoutByPerspective: {
			"persp-overview": { x: 950, y: 150 },
			"persp-architecture": { x: 950, y: 150 },
			"persp-process": { x: 300, y: 150 },
			"persp-journey": { x: 300, y: 150 },
			"persp-provider": { x: 950, y: 150 },
		},
	},
	{
		id: "n-account-svc",
		type: "service",
		label: "Account Service",
		description: "Account lifecycle management",
		tags: ["accounts", "core"],
		layoutByPerspective: {
			"persp-overview": { x: 950, y: 300 },
			"persp-architecture": { x: 950, y: 300 },
			"persp-process": { x: 600, y: 150 },
			"persp-journey": { x: 600, y: 150 },
			"persp-provider": { x: 950, y: 300 },
		},
	},
	{
		id: "n-core-ledger",
		type: "system",
		label: "Core Ledger",
		description: "Double-entry ledger and system of record",
		tags: ["core", "ledger", "system-of-record"],
		layoutByPerspective: {
			"persp-overview": { x: 1300, y: 250 },
			"persp-architecture": { x: 1300, y: 250 },
			"persp-process": { x: 900, y: 100 },
			"persp-journey": { x: 900, y: 100 },
			"persp-provider": { x: 1300, y: 250 },
		},
	},
	{
		id: "n-notification-svc",
		type: "service",
		label: "Notification Service",
		description: "Customer notifications and alerts",
		tags: ["notifications", "messaging"],
		layoutByPerspective: {
			"persp-overview": { x: 1300, y: 400 },
			"persp-architecture": { x: 1300, y: 400 },
			"persp-process": { x: 900, y: 250 },
			"persp-journey": { x: 900, y: 250 },
			"persp-provider": { x: 1300, y: 400 },
		},
	},
	{
		id: "n-payment-orch",
		type: "service",
		label: "Payment Orchestrator",
		description: "Payment routing and orchestration",
		tags: ["payments", "orchestration"],
		layoutByPerspective: {
			"persp-overview": { x: 950, y: 450 },
			"persp-architecture": { x: 950, y: 450 },
			"persp-process": { x: 300, y: 300 },
			"persp-provider": { x: 950, y: 450 },
		},
	},
	{
		id: "n-payment-rail",
		type: "system",
		label: "Payment Rail",
		description: "External payment network interface (ACH, RTP, FedNow)",
		tags: ["payments", "rails", "external"],
		layoutByPerspective: {
			"persp-overview": { x: 1300, y: 500 },
			"persp-architecture": { x: 1300, y: 500 },
			"persp-process": { x: 600, y: 300 },
			"persp-provider": { x: 1300, y: 500 },
		},
	},
].map((d) => NodeSchema.parse(d));

// --- Edges ---

export const edges: Edge[] = [
	{
		id: "e-cust-app",
		sourceNodeId: "n-customer",
		targetNodeId: "n-mobile-app",
		type: "user_interaction",
		label: "uses",
	},
	{
		id: "e-app-gw",
		sourceNodeId: "n-mobile-app",
		targetNodeId: "n-api-gateway",
		type: "api_call",
		label: "requests",
	},
	{
		id: "e-gw-identity",
		sourceNodeId: "n-api-gateway",
		targetNodeId: "n-identity-svc",
		type: "service_call",
		label: "verify identity",
	},
	{
		id: "e-gw-account",
		sourceNodeId: "n-api-gateway",
		targetNodeId: "n-account-svc",
		type: "service_call",
		label: "manage account",
	},
	{
		id: "e-gw-payment",
		sourceNodeId: "n-api-gateway",
		targetNodeId: "n-payment-orch",
		type: "service_call",
		label: "initiate payment",
	},
	{
		id: "e-identity-risk",
		sourceNodeId: "n-identity-svc",
		targetNodeId: "n-risk-svc",
		type: "dependency",
		label: "risk check",
	},
	{
		id: "e-risk-payment",
		sourceNodeId: "n-risk-svc",
		targetNodeId: "n-payment-orch",
		type: "decision_result",
		label: "risk decision",
	},
	{
		id: "e-account-ledger",
		sourceNodeId: "n-account-svc",
		targetNodeId: "n-core-ledger",
		type: "ledger_posting",
		label: "post entries",
	},
	{
		id: "e-account-notify",
		sourceNodeId: "n-account-svc",
		targetNodeId: "n-notification-svc",
		type: "event",
		label: "notify",
	},
	{
		id: "e-payment-rail",
		sourceNodeId: "n-payment-orch",
		targetNodeId: "n-payment-rail",
		type: "rail_execution",
		label: "execute",
	},
	{
		id: "e-payment-ledger",
		sourceNodeId: "n-payment-orch",
		targetNodeId: "n-core-ledger",
		type: "ledger_posting",
		label: "post entries",
	},
].map((d) => EdgeSchema.parse(d));

// --- Journey ---

export const steps: Step[] = [
	{
		id: "s-1",
		journeyId: "j-open-savings",
		sequenceNumber: 0,
		focusTargets: [
			{ type: "node", targetId: "n-customer" },
			{ type: "node", targetId: "n-mobile-app" },
		],
		capabilityId: "cap-onboarding",
		title: "Launch & Authenticate",
		narrative: "Customer opens the mobile banking app and authenticates.",
		actor: "Customer",
		expectedAction: "Open app, enter credentials",
		nextStepIds: ["s-2"],
		sceneId: "sc-1",
	},
	{
		id: "s-2",
		journeyId: "j-open-savings",
		sequenceNumber: 1,
		focusTargets: [{ type: "node", targetId: "n-mobile-app" }],
		capabilityId: "cap-onboarding",
		title: "Fill Application",
		narrative: "Customer enters personal information and selects savings product.",
		actor: "Customer",
		expectedAction: "Complete application form",
		nextStepIds: ["s-3"],
		sceneId: "sc-2",
	},
	{
		id: "s-3",
		journeyId: "j-open-savings",
		sequenceNumber: 2,
		focusTargets: [
			{ type: "node", targetId: "n-identity-svc" },
			{ type: "edge", targetId: "e-gw-identity" },
		],
		capabilityId: "cap-onboarding",
		title: "Identity Verification",
		narrative: "System verifies customer identity through KYC provider.",
		actor: "System",
		expectedAction: "Verify identity documents and data",
		nextStepIds: ["s-4"],
		sceneId: "sc-3",
		evidenceRefIds: ["ev-kyc-policy"],
	},
	{
		id: "s-4",
		journeyId: "j-open-savings",
		sequenceNumber: 3,
		focusTargets: [
			{ type: "node", targetId: "n-risk-svc" },
			{ type: "edge", targetId: "e-identity-risk" },
		],
		capabilityId: "cap-onboarding",
		title: "Risk Assessment",
		narrative: "System runs risk, fraud, and compliance checks.",
		actor: "System",
		expectedAction: "Evaluate risk score and policy compliance",
		nextStepIds: ["s-5"],
		sceneId: "sc-4",
	},
	{
		id: "s-5",
		journeyId: "j-open-savings",
		sequenceNumber: 4,
		focusTargets: [
			{ type: "node", targetId: "n-account-svc" },
			{ type: "node", targetId: "n-core-ledger" },
			{ type: "edge", targetId: "e-account-ledger" },
		],
		capabilityId: "cap-account-opening",
		title: "Account Creation",
		narrative: "Account is created in the system of record and ledger entries are posted.",
		actor: "System",
		expectedAction: "Create account, post opening ledger entries",
		nextStepIds: ["s-6"],
		sceneId: "sc-5",
		evidenceRefIds: ["ev-account-reg"],
	},
	{
		id: "s-6",
		journeyId: "j-open-savings",
		sequenceNumber: 5,
		focusTargets: [
			{ type: "node", targetId: "n-notification-svc" },
			{ type: "node", targetId: "n-mobile-app" },
			{ type: "edge", targetId: "e-account-notify" },
		],
		capabilityId: "cap-account-opening",
		title: "Confirmation",
		narrative: "Customer receives confirmation and notifications are sent.",
		actor: "System",
		expectedAction: "Display confirmation, send notifications",
		nextStepIds: [],
		sceneId: "sc-6",
	},
].map((d) => StepSchema.parse(d));

export const journeys: Journey[] = [
	{
		id: "j-open-savings",
		label: "Open Savings Account",
		description: "End-to-end journey for a customer opening a new savings account.",
		entryCapabilityId: "cap-onboarding",
		capabilityIds: ["cap-onboarding", "cap-account-opening"],
		stepIds: ["s-1", "s-2", "s-3", "s-4", "s-5", "s-6"],
		tags: ["savings", "origination", "golden-path"],
	},
].map((d) => JourneySchema.parse(d));

// --- Perspectives ---

export const perspectives: Perspective[] = [
	{
		id: "persp-overview",
		type: "overview",
		label: "Overview",
		description: "High-level view of all domains and systems",
		defaultLayerId: "layer-default",
	},
	{
		id: "persp-architecture",
		type: "architecture",
		label: "Architecture",
		description: "System boundaries, services, and dependencies",
		defaultLayerId: "layer-default",
	},
	{
		id: "persp-provider",
		type: "provider",
		label: "Provider",
		description: "Provider and vendor comparison view",
		defaultLayerId: "layer-default",
	},
	{
		id: "persp-process",
		type: "process",
		label: "Process",
		description: "Business process and workflow steps",
		defaultLayerId: "layer-process",
	},
	{
		id: "persp-journey",
		type: "journey",
		label: "Journey",
		description: "User journey step-by-step traversal",
		defaultLayerId: "layer-journey",
	},
].map((d) => PerspectiveSchema.parse(d));

// --- Layers ---

export const layers: Layer[] = [
	{
		id: "layer-default",
		label: "Default",
		eligibleNodeTypes: [],
		eligibleEdgeTypes: [],
		layoutStrategy: "auto",
	},
	{
		id: "layer-process",
		label: "Process",
		eligibleNodeTypes: ["service", "system"],
		eligibleEdgeTypes: ["service_call", "ledger_posting", "event", "dependency", "decision_result"],
		layoutStrategy: "auto",
	},
	{
		id: "layer-journey",
		label: "Journey",
		eligibleNodeTypes: ["actor", "screen", "service", "system"],
		eligibleEdgeTypes: ["user_interaction", "api_call", "service_call", "ledger_posting", "event"],
		layoutStrategy: "manual",
	},
].map((d) => LayerSchema.parse(d));

// --- Scenes ---

export const scenes: Scene[] = [
	{
		id: "sc-1",
		stepId: "s-1",
		uiStateRef: "screen://account-opening/login",
		focusTargets: ["n-customer", "n-mobile-app"],
		instructionalCopy: "Customer opens the banking app and logs in with their credentials.",
	},
	{
		id: "sc-2",
		stepId: "s-2",
		uiStateRef: "screen://account-opening/application-form",
		focusTargets: ["n-mobile-app"],
		instructionalCopy:
			"Customer fills in personal details and selects the savings account product.",
	},
	{
		id: "sc-3",
		stepId: "s-3",
		uiStateRef: "screen://account-opening/identity-check",
		focusTargets: ["n-identity-svc"],
		instructionalCopy: "The system performs identity verification using the KYC provider.",
	},
	{
		id: "sc-4",
		stepId: "s-4",
		uiStateRef: "screen://account-opening/risk-check",
		focusTargets: ["n-risk-svc"],
		instructionalCopy: "Risk and compliance checks are performed against fraud and policy rules.",
	},
	{
		id: "sc-5",
		stepId: "s-5",
		uiStateRef: "screen://account-opening/processing",
		focusTargets: ["n-account-svc", "n-core-ledger"],
		instructionalCopy: "The account is created and opening ledger entries are posted.",
	},
	{
		id: "sc-6",
		stepId: "s-6",
		uiStateRef: "screen://account-opening/confirmation",
		focusTargets: ["n-notification-svc", "n-mobile-app"],
		instructionalCopy: "Customer sees the confirmation screen and receives a welcome notification.",
	},
].map((d) => SceneSchema.parse(d));

// --- Annotations ---

export const annotations: Annotation[] = [
	{
		id: "ann-1",
		targetType: "node",
		targetId: "n-identity-svc",
		type: "research_note",
		content:
			"Identity verification may use document scanning, knowledge-based authentication, or third-party identity providers depending on risk tier.",
		author: "system",
		createdAt: "2026-01-15T10:00:00Z",
	},
	{
		id: "ann-2",
		targetType: "node",
		targetId: "n-risk-svc",
		type: "risk_note",
		content:
			"Risk decisioning evaluates fraud signals, identity confidence score, and regulatory compliance before allowing account creation.",
		author: "system",
		createdAt: "2026-01-15T10:00:00Z",
	},
	{
		id: "ann-3",
		targetType: "node",
		targetId: "n-core-ledger",
		type: "control_note",
		content:
			"All account opening transactions must create balanced double-entry ledger postings. Opening balance must match the initial deposit amount.",
		author: "system",
		createdAt: "2026-01-15T10:00:00Z",
	},
].map((d) => AnnotationSchema.parse(d));

// --- Evidence Refs ---

export const evidenceRefs: EvidenceRef[] = [
	{
		id: "ev-kyc-policy",
		title: "KYC Policy Requirements",
		type: "document",
		summary: "Regulatory requirements for customer identity verification in account opening.",
		accessClassification: "internal",
		relatedEntityIds: ["n-identity-svc", "cap-onboarding"],
	},
	{
		id: "ev-account-reg",
		title: "Account Opening Regulatory Framework",
		type: "document",
		summary:
			"Regulatory framework governing savings account origination and initial deposit requirements.",
		accessClassification: "internal",
		relatedEntityIds: ["n-account-svc", "n-core-ledger", "cap-account-opening"],
	},
].map((d) => EvidenceRefSchema.parse(d));
