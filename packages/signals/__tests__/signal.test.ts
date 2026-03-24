import { describe, expect, it, vi } from "vitest";

import { createSignal } from "../src/signal";

describe("createSignal", () => {
  it("gets and sets values", () => {
    const signal = createSignal(1);

    expect(signal.get()).toBe(1);

    signal.set(2);

    expect(signal.get()).toBe(2);
  });

  it("does not notify when the value is unchanged", () => {
    const signal = createSignal(1);
    const subscriber = vi.fn();

    signal.subscribe(subscriber);
    signal.set(1);

    expect(subscriber).not.toHaveBeenCalled();
  });

  it("notifies subscribers when the value changes", () => {
    const signal = createSignal(1);
    const subscriber = vi.fn();

    signal.subscribe(subscriber);
    signal.set(2);

    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it("supports unsubscribe", () => {
    const signal = createSignal(1);
    const subscriber = vi.fn();

    const unsubscribe = signal.subscribe(subscriber);
    unsubscribe();

    signal.set(2);

    expect(subscriber).not.toHaveBeenCalled();
  });

  it("notifies a stable subscriber snapshot during updates", () => {
    const signal = createSignal(1);
    const subscriber = vi.fn();
    let unsubscribe = signal.subscribe(() => {
      subscriber();
      unsubscribe();
      unsubscribe = signal.subscribe(subscriber);
    });

    signal.set(2);

    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
