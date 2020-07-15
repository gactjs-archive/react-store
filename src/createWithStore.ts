import { StoreValue } from "@gact/store";

import { ReactStore, StoreConsumer, WithStore } from "./types";

/**
 * Creates the `withStore` higher order function
 *
 * @typeParam S - the state tree
 */
export function createWithStore<S extends StoreValue>(
  store: ReactStore<S>
): WithStore<S> {
  return function withStore(
    consumer: StoreConsumer<S>
  ): ReturnType<StoreConsumer<S>> {
    return consumer(store);
  };
}
