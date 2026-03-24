import { useRef, useSyncExternalStore } from "react";

import type { Signal } from "./signal.js";

type ReadableSignal<T> = Pick<Signal<T>, "get" | "subscribe">;

type SelectedSnapshot<T> = {
  value: T;
};

export function useSignal<T>(signal: ReadableSignal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get);
}

export function useSignalSelector<T, U>(
  signal: ReadableSignal<T>,
  selector: (value: T) => U,
): U {
  const snapshotRef = useRef<SelectedSnapshot<U> | null>(null);

  const getSnapshot = (): SelectedSnapshot<U> => {
    const selectedValue = selector(signal.get());
    const currentSnapshot = snapshotRef.current;

    if (currentSnapshot !== null && Object.is(currentSnapshot.value, selectedValue)) {
      return currentSnapshot;
    }

    const nextSnapshot = { value: selectedValue };
    snapshotRef.current = nextSnapshot;
    return nextSnapshot;
  };

  return useSyncExternalStore(signal.subscribe, getSnapshot, getSnapshot).value;
}
