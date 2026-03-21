# viewscape-core

Canonical headless model for a business architecture navigator. Provides the domain model, state machines, context synchronization, and contract definitions consumed by both Viewscape (terrain discovery) and GuideRail (guided traversal).

## Commands

```bash
pnpm install        # install dependencies
pnpm build          # tsc → dist/
pnpm test           # vitest run
pnpm test:watch     # vitest watch
pnpm check          # biome check
pnpm check:fix      # biome check --fix
```

## Tech Stack

- TypeScript (strict, ESM)
- Zod — schema validation
- XState v5 — state machines
- Vitest — testing
- Biome — formatting/linting

## Conceptual Model

```
Navigation layer:    Domain → Capability → Journey → Step
                                    ↕ (references, not owns)
Terrain layer:       Node ←→ Edge
                                    ↕ (determines visibility/emphasis)
View layer:          Perspective → Layer (rendering rules)
```

- **Domain** = broad business area (e.g., Payments, Accounts)
- **Capability** = enduring business ability within a domain (e.g., Account Opening, Fraud Detection)
- **Journey** = outcome-oriented path through one or more capabilities
- **Perspective** = how the user is viewing the context (architecture, provider, process, sequence, control)
- **Layer** = rendering/layout rules for a perspective
- **Node / Edge** = terrain primitives that form the graph underneath

Capabilities, Journeys, and Perspectives organize the terrain; Nodes and Edges form the terrain.

## Key Design Rules

1. **No UI code.** This library is pure TypeScript + Zod + XState. No React, no rendering, no DOM.

2. **Source of truth stays outside.** The kernel is a navigation/projection layer, not a system of record. External repos/corpora are the source of truth.

3. **Context Machine is the single authority.** Child machines (navigation, journey, route, perspective) own behavioral transitions. The Context Machine holds the unified NavigationContext that consumers read. Never read state from child machines directly.

4. **Multi-target focus.** A Step activates multiple focus targets (node, edge, scene_element, annotation, etc.). The core owns *what* is in focus; consumers own *how* it is shown. No pane choreography in the kernel.

5. **References, not ownership.** Capability references Nodes — it does not own them. A Node may participate in many Capabilities. Domain does not own an ordered capability list; Capabilities reference their domainId.

6. **Journey has an entry capability.** `entryCapabilityId` is the deterministic home anchor. When a journey is selected without prior domain/capability context, entry capability wins.

7. **Perspective switching preserves everything.** Switching perspective never disrupts domain/capability/journey/step state. Only domain/capability switching cascades downward.

8. **v1 pragmatism.** `Capability.nodeIds`, `Node.layoutByPerspective`, and `Perspective.defaultLayerId` are practical starting points, not permanent laws.

## Plan

See `/Users/jladd/Code/plans/viewscape-core-plan.md` for the full implementation plan.

## Project Structure

```
src/
├── entities/       # Zod schemas + inferred types for all domain concepts
├── provenance/     # Provenance tracking model
├── graph/          # In-memory graph container + query/traversal/filter
├── machines/       # XState v5 state machines (headless, no UI)
├── context/        # Context synchronization — NavigationContext + reconciler
├── perspective/    # Perspective provider contracts
├── adapters/       # Source adapter contracts (interfaces only)
├── indexing/       # Indexing pipeline contracts (interfaces only)
└── test-fixtures/  # Seed data + factory helpers
```
