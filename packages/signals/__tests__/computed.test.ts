import { describe, expect, it, vi } from "vitest";

import { computed } from "../src/computed";
import { createSignal } from "../src/signal";

describe("computed", () => {
  it("is lazy until accessed", () => {
    const source = createSignal(1);
    const computeValue = vi.fn(() => source.get() * 2);

    computed(computeValue);

    expect(computeValue).not.toHaveBeenCalled();
  });

  it("caches the computed result", () => {
    const source = createSignal(2);
    const computeValue = vi.fn(() => source.get() * 2);
    const value = computed(computeValue);

    expect(value.get()).toBe(4);
    expect(value.get()).toBe(4);
    expect(computeValue).toHaveBeenCalledTimes(1);
  });

  it("recomputes when a dependency changes", () => {
    const source = createSignal(2);
    const computeValue = vi.fn(() => source.get() * 2);
    const value = computed(computeValue);

    expect(value.get()).toBe(4);

    source.set(3);

    expect(value.get()).toBe(6);
    expect(computeValue).toHaveBeenCalledTimes(2);
  });

  it("does not recompute unnecessarily after invalidation", () => {
    const source = createSignal(1);
    const value = computed(() => source.get() + 1);
    const subscriber = vi.fn();

    value.subscribe(subscriber);
    expect(value.get()).toBe(2);

    source.set(2);
    source.set(3);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(value.get()).toBe(4);
  });

  it("notifies a stable subscriber snapshot while recomputing", () => {
    const source = createSignal(1);
    const value = computed(() => source.get() + 1);
    const subscriber = vi.fn();
    let unsubscribe = value.subscribe(() => {
      subscriber();
      unsubscribe();
      value.get();
      unsubscribe = value.subscribe(subscriber);
    });

    expect(value.get()).toBe(2);

    source.set(2);

    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
