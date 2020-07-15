import { useReducer, useRef, useCallback, useLayoutEffect } from "react";
import { Store, StoreValue, Path, PathFor, Value } from "@gact/store";

import { createReactiveCollection } from "./createReactiveCollection";
import { UseValue, Transformer } from "./types";

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

  return function useValue<P extends Path<S>, V extends StoreValue, T>(
    path: P | PathFor<S, V>,
    transformer?: Transformer<Value<S, P, V>, T>
  ): Value<S, P, V> | T {
    const [, forceRender] = useReducer((s) => s + 1, 0);

    const latestValue = useRef<Value<S, P, V> | T>(
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
