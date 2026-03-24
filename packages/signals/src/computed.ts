import {
  registerDependency,
  type DependencyCollector,
  type Subscribable,
  type Subscriber,
  withDependencyCollector,
} from "./internal.js";

export type Computed<T> = {
  get(): T;
  subscribe(fn: Subscriber): () => void;
};

class ComputedSignal<T> implements DependencyCollector, Subscribable {
  private readonly computeValue: () => T;
  private readonly subscribers = new Set<Subscriber>();
  private readonly dependencies = new Map<Subscribable, () => void>();

  private cachedValue!: T;
  private hasCachedValue = false;
  private isDirty = true;
  private isComputing = false;

  constructor(computeValue: () => T) {
    this.computeValue = computeValue;
  }

  get(): T {
    registerDependency(this);

    if (this.isDirty) {
      this.recompute();
    }

    return this.cachedValue;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);

    return () => {
      this.subscribers.delete(fn);
    };
  }

  addDependency(dependency: Subscribable): void {
    if (dependency === this) {
      return;
    }

    if (this.dependencies.has(dependency)) {
      return;
    }

    const unsubscribe = dependency.subscribe(() => {
      this.markDirty();
    });

    this.dependencies.set(dependency, unsubscribe);
  }

  private markDirty(): void {
    if (this.isDirty) {
      return;
    }

    this.isDirty = true;

    for (const subscriber of [...this.subscribers]) {
      subscriber();
    }
  }

  private recompute(): void {
    if (this.isComputing) {
      throw new Error("Circular computed dependency detected");
    }

    this.cleanupDependencies();
    this.isComputing = true;

    try {
      const nextValue = withDependencyCollector(this, this.computeValue);
      this.cachedValue = nextValue;
      this.hasCachedValue = true;
      this.isDirty = false;
    } catch (error) {
      this.cleanupDependencies();
      throw error;
    } finally {
      this.isComputing = false;
    }
  }

  private cleanupDependencies(): void {
    for (const unsubscribe of this.dependencies.values()) {
      unsubscribe();
    }

    this.dependencies.clear();
  }
}

export function computed<T>(computeValue: () => T): Computed<T> {
  const computation = new ComputedSignal(computeValue);

  return {
    get: () => computation.get(),
    subscribe: (fn) => computation.subscribe(fn),
  };
}
