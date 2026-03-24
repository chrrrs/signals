import { createSignal } from "./signal.js";

export type AsyncSignal<T> = {
  get(): T | undefined;
  load(): Promise<T>;
};

export function createAsyncSignal<T>(loadValue: () => Promise<T>): AsyncSignal<T> {
  const valueSignal = createSignal<T | undefined>(undefined);
  let pendingPromise: Promise<T> | null = null;
  let hasResolved = false;

  return {
    get() {
      return valueSignal.get();
    },
    load() {
      if (hasResolved) {
        return Promise.resolve(valueSignal.get() as T);
      }

      if (pendingPromise) {
        return pendingPromise;
      }

      pendingPromise = loadValue().then(
        (value) => {
          valueSignal.set(value);
          hasResolved = true;
          pendingPromise = null;
          return value;
        },
        (error) => {
          pendingPromise = null;
          throw error;
        },
      );

      return pendingPromise;
    },
  };
}
