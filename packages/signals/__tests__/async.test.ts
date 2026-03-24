import { describe, expect, it, vi } from "vitest";

import { createAsyncSignal } from "../src/async";

describe("createAsyncSignal", () => {
  it("resolves and stores the loaded value", async () => {
    const asyncSignal = createAsyncSignal(async () => 42);

    expect(asyncSignal.get()).toBeUndefined();
    await expect(asyncSignal.load()).resolves.toBe(42);
    expect(asyncSignal.get()).toBe(42);
  });

  it("caches resolved values", async () => {
    const loadValue = vi.fn(async () => 42);
    const asyncSignal = createAsyncSignal(loadValue);

    await asyncSignal.load();
    await asyncSignal.load();

    expect(loadValue).toHaveBeenCalledTimes(1);
  });

  it("reuses the pending promise for duplicate loads", async () => {
    const loadValue = vi.fn(
      () =>
        new Promise<number>((resolve) => {
          setTimeout(() => resolve(42), 0);
        }),
    );
    const asyncSignal = createAsyncSignal(loadValue);

    const firstLoad = asyncSignal.load();
    const secondLoad = asyncSignal.load();

    expect(firstLoad).toBe(secondLoad);
    await expect(firstLoad).resolves.toBe(42);
    expect(loadValue).toHaveBeenCalledTimes(1);
  });
});
