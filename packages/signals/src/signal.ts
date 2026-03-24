import { registerDependency, type Subscriber } from "./internal.js";

export type Signal<T> = {
  get(): T;
  set(value: T): void;
  subscribe(fn: Subscriber): () => void;
};

export function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();
  const signal: Signal<T> = {
    get() {
      registerDependency(signal);
      return value;
    },
    set(nextValue) {
      if (Object.is(value, nextValue)) {
        return;
      }

      value = nextValue;

      for (const subscriber of [...subscribers]) {
        subscriber();
      }
    },
    subscribe(fn) {
      subscribers.add(fn);

      return () => {
        subscribers.delete(fn);
      };
    },
  };

  return signal;
}
