import { Path, PathFor, Value, StoreValue, Store } from "@gact/store";

/**
 * A subscriber to a `ReactiveCollection`
 */
export type Listener = () => void;

/**
 * Subscribes the provided listener to changes to the provided path
 *
 * @typeParam S - the state tree
 * @typeParam P - the path to subscribe to
 * @typeParam V - the value at the provided path
 */
export type Subscribe<S extends StoreValue> = <
  P extends Path<S>,
  V extends StoreValue
>(
  path: P | PathFor<S, V>,
  listener: Listener
) => () => void;

/**
 * Provides reactivity with exact change tracking.
 *
 * @typeParam S - the state tree
 *
 * @remarks
 * The initial call to a `ReactiveCollection` turns reactivity on and returns
 * a way to subscribe to the collection. This ensures that you only subscribe
 * to an active `ReactiveCollection`.
 *
 * There is no way to turn off reactivity because the collection is expected to
 * run the entire lifetime of an application.
 */
export type ReactiveCollection<S extends StoreValue> = () => Subscribe<S>;

/**
 * Converts a value in the store to one needed by the UI.
 *
 * @typeParam V - the value in the store
 * @typeParam T - the converted value
 */
export type Transformer<V, T> = (value: V) => T;

/**
 * The useValue hook is the primary way to **reactively** access values from
 * the Gact store.
 *
 * @remarks
 * Uses `Object.is` equality to prevent unnecessary renders. If a transformer
 * is provided, the transformed values are compared.
 *
 * If you do not need a value **reactively**, then you should `get` the value.
 * For example, if you render the value, then `useValue` is appropriate. On
 * the other hand, if you use a value as a paramter in a network request,
 * then `get` is appropriate.
 *
 * @typeParam S - the state tree
 */
export type UseValue<S extends StoreValue> = {
  <P extends Path<S>, V extends StoreValue>(path: P | PathFor<S, V>): Value<
    S,
    P,
    V
  >;
  <P extends Path<S>, V extends StoreValue, T>(
    path: P | PathFor<S, V>,
    transformer: Transformer<Value<S, P, V>, T>
  ): T;
};

/**
 * The general React interface to the Gact store.
 *
 * @remarks
 * External components will interact with the Gact store through
 * the `ReactStore`
 */
export type ReactStore<S extends StoreValue> = Store<S> & {
  useValue: UseValue<S>;
};

/**
 * Consumers of the Gact Store
 *
 * @typeParam S - the state tree
 * @typeParam T - the value produced by the consumer
 */
export type StoreConsumer<S extends StoreValue> = <T>(
  store: ReactStore<S>
) => T;

/**
 * A higher-order function that provides a consumer with the `ReactStore`.
 *
 * @typeParam T - the state tree
 */
export type WithStore<S extends StoreValue> = (
  consumer: StoreConsumer<S>
) => ReturnType<StoreConsumer<S>>;

/**
 * React bindings to the Gact store.
 *
 * @typeParam S - the state tree
 */
export type Bindings<S extends StoreValue> = {
  useValue: UseValue<S>;
  withStore: WithStore<S>;
};
