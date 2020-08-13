import { Store, StoreValue } from "@gact/store";
import { createUseValue } from "./createUseValue";
import { createWithStore } from "./createWithStore";
import { Bindings } from "./types";

/**
 * Creates React bindings to the Gact store
 *
 * @typeParam S - the state tree
 */
export function createBindings<S extends StoreValue>(
  store: Store<S>
): Bindings<S> {
  const useValue = createUseValue(store);
  const withStore = createWithStore({ ...store, useValue });

  return { useValue, withStore };
}
