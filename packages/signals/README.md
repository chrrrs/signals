# @chrrrs/signals

Minimal React 19 signals for local state and derived values.

## SSR note

Signals created at module scope are shared across SSR requests.

Avoid:

```ts
export const count = createSignal(0);
```

Use:

```ts
import { createSignal } from "@chrrrs/signals";

export function createState() {
  return {
    count: createSignal(0),
  };
}
```
