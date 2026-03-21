# viewscape-core

Canonical headless model for a business architecture navigator. Provides the domain model, state machines, context synchronization, and contract definitions for Viewscape and GuideRail.

## Install

```bash
pnpm install
```

## Develop

```bash
pnpm build          # compile TypeScript → dist/
pnpm test           # run tests
pnpm test:watch     # run tests in watch mode
pnpm check          # lint and format check
pnpm check:fix      # auto-fix lint and format issues
```

## Usage

```ts
import { NodeSchema, DomainSchema } from "viewscape-core/entities";
import { createGraph } from "viewscape-core/graph";
import { journeyMachine } from "viewscape-core/machines";
import { reconcilePerspectiveSwitch } from "viewscape-core/context";
```

## License

[MIT](LICENSE)
