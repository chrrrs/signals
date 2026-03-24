export type Subscriber = () => void;

export interface Subscribable {
  subscribe(fn: Subscriber): () => void;
}

export interface DependencyCollector {
  addDependency(dependency: Subscribable): void;
}

let activeCollector: DependencyCollector | null = null;

export function withDependencyCollector<T>(collector: DependencyCollector, fn: () => T): T {
  const previousCollector = activeCollector;
  activeCollector = collector;

  try {
    return fn();
  } finally {
    activeCollector = previousCollector;
  }
}

export function registerDependency(dependency: Subscribable): void {
  activeCollector?.addDependency(dependency);
}
