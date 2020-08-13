import { PathFor, Store, StoreValue } from "@gact/store";
import { useCallback, useLayoutEffect, useReducer, useRef } from "react";
import { createReactiveCollection } from "./createReactiveCollection";
import { Transformer, UseValue } from "./types";

/**
 * Creates the `useValue` hook.
 *
 * @remarks
 *
 * @typeParam S - the state tree
 */
export function createUseValue<S extends StoreValue>(
  store: Store<S>
): UseValue<S> {
  const subscribe = createReactiveCollection(store)();

  return function useValue<V extends StoreValue, T>(
    path: PathFor<S, V>,
    transformer?: Transformer<V, T>
  ): V | T {
    const [, forceRender] = useReducer((s) => s + 1, 0);

    const latestValue = useRef<V | T>(
      transformer ? transformer(store.get(path)) : store.get(path)
    );

    const checkForUpdate = useCallback(
      function() {
        const newLatestValue = transformer
          ? transformer(store.get(path))
          : store.get(path);

        if (Object.is(newLatestValue, latestValue.current)) {
          return;
        }

        latestValue.current = newLatestValue;
        forceRender();
      },
      [forceRender, transformer]
    );

    useLayoutEffect(
      function() {
        checkForUpdate();
        return subscribe(path, checkForUpdate);
      },
      [path, checkForUpdate]
    );

    return latestValue.current!;
  };
}
