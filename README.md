# Reactive Signals for React

A tiny, fully typed and zero-dependency signals library for React 19, inspired by SolidJS and Apollo.
Features include synchronous signals, computed signals with auto-tracking, async signals with Suspense, selector hooks, and batching.

---

## ⚡ Features

✅ Simple reactive signals (createSignal)  
✅ Auto-tracked computed signals (computed)  
✅ React hooks (useSignal, useSignalSelector)  
✅ [WIP] Async signals with Suspense support (createAsyncSignal, useAsyncSignal)  
✅ Global shared signals (like Apollo cache)  
✅ Fully typed and tree-shakeable

---

## **📦 Installation**

```
npm install @chrrrs/signals
# or
yarn add @chrrrs/signals
```

---

## **🛠️ Basic Usage**

### **Create a Signal**

```
import { createSignal } from "@chrrrs/signals";

export const count = createSignal(0);
```

### **React Hook**

```
import { useSignal } from "@chrrrs/signals";
import { count } from "./store";

export function Counter() {
  const value = useSignal(count);

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => count.set(value + 1)}>Increment</button>
    </div>
  );
}
```

---

## **✨ Computed Signals**

Auto-tracked dependencies — no manual deps required.

```
import { computed } from "@chrrrs/signals";
import { count } from "./store";

const double = computed(() => count.get() * 2);

const doubled = useSignal(double);
```

---

## **🚀 [WIP] Async Signals + Suspense**

An async signal is available, work-in-progress on the useAsyncSignal hook and Suspense examples

```
import { createAsyncSignal } from "@chrrrs/signals";

export const userSignal = createAsyncSignal(async () => {
  const res = await fetch("/api/user");
  return res.json();
});

<button onClick={() => void userSignal.load()}>Get user</button>
```

---

## **🎯 Selector Hook**

Subscribe to part of a signal to optimize re-renders:

```
import { useSignalSelector } from "@chrrrs/signals";
import { userSignal } from "./store";

const userName = useSignalSelector(userSignal, user => user?.name ?? "Guest");
```

---

## **✅ Best Practices**

1. Immutable values: Always .set() new values; do not mutate objects inside a signal.
2. Use signals for shared state: Component-local UI state is fine in useState.
3. Use async signals for initial fetch: Combine with Suspense, but don’t wrap frequently changing data.
4. Batch updates: Use batch() when updating multiple signals together.
5. Selector hook: Use useSignalSelector to minimize unnecessary re-renders when only part of the signal matters.

---

## **How It Differs From Larger Libraries:**

| Feature                       | `@chrrrs/signals`                                 | Zustand / Jotai / Valtio                                 |
| ----------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Size & simplicity             | Minimal, easy-to-read API                         | Larger, more concepts to learn                           |
| Auto-tracked computed signals | ✅ Recomputes automatically based on dependencies | Zustand: manual derived state Jotai: manual dependencies |
| Async + Suspense integration  | ✅ Built-in support via `createAsyncSignal`       | Jotai: supports async atoms, requires extra boilerplate  |
| Batching                      | ✅ Out-of-the-box                                 | Zustand: requires middleware or manual batching          |
| Tree-shakeable                | ✅ Fully modular                                  | Varies                                                   |
| Learning / debugging          | ✅ Small, readable codebase                       | Larger codebases, more abstractions                      |

> **Intended audience:** Developers who want **small, reactive primitives,** not a full-blown state management framework.

---

## **Common questions and answers**

### **Why not just use useState and context?**

useState and context are great for component-local state. If you only need to store a single value, use useState. However, context will cause re-renders of all components that use the context, which can be wasteful, if multiple values or complex state logic is needed, so use signals for shared state instead.

### **Why no batching logic?**

Batching is implicit in React 19. When you update a signal, all components that use that signal will re-render. No need for a batching function.
