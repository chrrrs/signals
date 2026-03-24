// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { createSignal } from "../src/signal";
import { useSignal, useSignalSelector } from "../src/useSignal";

describe("signal hooks", () => {
  it("re-renders a component when the signal updates", () => {
    const signal = createSignal(0);
    const container = document.createElement("div");
    const root = createRoot(container);
    let renderCount = 0;

    function Counter() {
      const value = useSignal(signal);
      renderCount += 1;
      return <span>{value}</span>;
    }

    act(() => {
      root.render(<Counter />);
    });

    expect(container.textContent).toBe("0");
    expect(renderCount).toBe(1);

    act(() => {
      signal.set(1);
    });

    expect(container.textContent).toBe("1");
    expect(renderCount).toBe(2);

    act(() => {
      root.unmount();
    });
  });

  it("skips re-renders when the selected value is equal", () => {
    const signal = createSignal({ count: 0, label: "a" });
    const container = document.createElement("div");
    const root = createRoot(container);
    let renderCount = 0;

    function Counter() {
      const count = useSignalSelector(signal, (value) => value.count);
      renderCount += 1;
      return <span>{count}</span>;
    }

    act(() => {
      root.render(<Counter />);
    });

    expect(renderCount).toBe(1);

    act(() => {
      signal.set({ count: 0, label: "b" });
    });

    expect(container.textContent).toBe("0");
    expect(renderCount).toBe(1);

    act(() => {
      signal.set({ count: 1, label: "b" });
    });

    expect(container.textContent).toBe("1");
    expect(renderCount).toBe(2);

    act(() => {
      root.unmount();
    });
  });
});
