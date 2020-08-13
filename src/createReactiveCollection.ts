import {
  computePathLineage,
  Path,
  PathFor,
  Store,
  StoreEvent,
  StoreValue,
} from "@gact/store";
import { unstable_batchedUpdates as batch } from "react-dom";
import { Listener, ReactiveCollection, Subscribe } from "./types";

function flatten<T>(deepArr: Array<Array<T>>): Array<T> {
  const result: Array<T> = [];
  for (const arr of deepArr) {
    for (const el of arr) {
      result.push(el);
    }
  }

  return result;
}

function dedup<T>(arr: Array<T>): Array<T> {
  return Array.from(new Set(arr));
}

function computeWritePaths<S extends StoreValue>(
  event: StoreEvent<S>
): Array<string> {
  switch (event.type) {
    case "SET":
    case "UPDATE":
    case "REMOVE":
      return Array.from(computePathLineage(event.path, event.prevValue)).map(
        String
      );
    case "TRANSACTION":
      return flatten(dedup(event.events.map(computeWritePaths)));
    default:
      return [];
  }
}

/**
 * Creates a `ReactiveCollection`
 *
 * @typeParam S - the state tree
 */
export function createReactiveCollection<S extends StoreValue>(
  store: Store<S>
): ReactiveCollection<S> {
  const pathToListeners: Map<string, Set<Listener>> = new Map();

  function addListener(path: string, listener: Listener): void {
    if (!pathToListeners.has(path)) {
      pathToListeners.set(path, new Set());
    }

    pathToListeners.get(path)!.add(listener);
  }

  function deleteListener(path: string, listener: Listener): void {
    const listeners = pathToListeners.get(path)!;

    listeners.delete(listener);

    if (listeners.size === 0) {
      pathToListeners.delete(path);
    }
  }

  function getListenersToNotify(event: StoreEvent<S>): Set<Listener> {
    const listenersToNotify: Set<Listener> = new Set();
    for (const path of computeWritePaths(event)) {
      if (pathToListeners.has(path)) {
        for (const listener of pathToListeners.get(path)!) {
          listenersToNotify.add(listener);
        }
      }
    }

    return listenersToNotify;
  }

  function notify(event: StoreEvent<S>): void {
    batch(function() {
      for (const listener of getListenersToNotify(event)) {
        listener();
      }
    });
  }

  function subscribe<P extends Path<S>, V extends StoreValue>(
    path: P | PathFor<S, V>,
    listener: Listener
  ): () => void {
    if (!store.canMutateSubscriptions()) {
      throw Error("Cannot subscribe during an update or transaction");
    }

    addListener(String(path), listener);

    return function unsubscribe(): void {
      if (!store.canMutateSubscriptions()) {
        throw Error("Cannot unsubscribe during an update or transaction");
      }

      deleteListener(String(path), listener);
    };
  }

  return function start(): Subscribe<S> {
    store.subscribe(notify);

    return subscribe;
  };
}
