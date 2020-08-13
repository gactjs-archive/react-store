import { createStore } from "@gact/store";
import { createReactiveCollection } from "../src/createReactiveCollection";

describe("createReactive", function() {
  type State = {
    a: string;
    b: {
      c: bigint;
    };
    d: Array<number>;
    e: Record<string, string>;
  };

  const initialState: State = {
    a: "a",
    b: {
      c: BigInt(0),
    },
    d: [],
    e: {},
  };

  test("create reactiveCollection", function() {
    expect(function() {
      const store = createStore(initialState);

      createReactiveCollection(store);
    }).not.toThrow();
  });

  test("simple scalar subscription", function() {
    const store = createStore(initialState);
    const { path, set, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriber = jest.fn();

    subscribe(store.path("a"), subscriber);

    set<string>(path("a"), "aa");

    expect(subscriber).toHaveBeenCalledTimes(1);
    subscriber.mockReset();

    update(path("a"), (a) => a + "a");
    expect(subscriber).toHaveBeenCalledTimes(1);
    subscriber.mockReset();
  });

  test("root subscription", function() {
    const store = createStore(initialState);
    const { path, set, update, remove } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriber = jest.fn();

    subscribe(path(), subscriber);

    set<string>(path("a"), "aa");
    update<bigint>(path("b", "c"), (c) => c + BigInt(100));
    update<Array<number>>(path("d"), function(d) {
      d.push(0);
    });
    set<string>(path("e", "bob"), "cool");
    remove(path("e", "bob"));

    expect(subscriber).toHaveBeenCalledTimes(5);
  });

  test("transaction", function() {
    const store = createStore(initialState);
    const { path, set, update, remove, transaction } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriber = jest.fn();

    subscribe(path(), subscriber);

    transaction(function() {
      set<string>(path("a"), "aa");
      update<bigint>(path("b", "c"), (c) => c + BigInt(100));
      update<Array<number>>(path("d"), function(d) {
        d.push(0);
      });
      set<string>(path("e", "bob"), "cool");
      remove(path("e", "bob"));
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  test("unsubscribe", function() {
    const store = createStore(initialState);
    const { path, set, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriber = jest.fn();

    const unsubscribe = subscribe(store.path("a"), subscriber);

    unsubscribe();

    set<string>(path("a"), "aa");
    update(path("a"), (a) => a + "a");

    expect(subscriber).not.toHaveBeenCalled();
  });

  test("multiple subscriptions to the same path", function() {
    const store = createStore(initialState);
    const { path, set, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriberOne = jest.fn();
    const subscriberTwo = jest.fn();

    subscribe(store.path("a"), subscriberOne);
    subscribe(store.path("a"), subscriberTwo);

    set<string>(path("a"), "aa");

    expect(subscriberOne).toHaveBeenCalledTimes(1);
    subscriberOne.mockReset();
    expect(subscriberTwo).toHaveBeenCalledTimes(1);
    subscriberTwo.mockReset();

    update(path("a"), (a) => a + "a");
    expect(subscriberOne).toHaveBeenCalledTimes(1);
    subscriberOne.mockReset();
    expect(subscriberTwo).toHaveBeenCalledTimes(1);
    subscriberTwo.mockReset();
  });

  test("multiple unsubscribes from the same path", function() {
    const store = createStore(initialState);
    const { path, set, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const subscriberOne = jest.fn();
    const subscriberTwo = jest.fn();

    const unsubscribeOne = subscribe(store.path("a"), subscriberOne);
    const unsubscribeTwo = subscribe(store.path("a"), subscriberTwo);

    unsubscribeOne();
    unsubscribeTwo();

    set<string>(path("a"), "aa");
    update(path("a"), (a) => a + "a");

    expect(subscriberOne).not.toHaveBeenCalled();
    expect(subscriberTwo).not.toHaveBeenCalled();
  });

  test("trying to subscribe during an update throws", function() {
    const store = createStore(initialState);
    const { path, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    expect(function() {
      update(path(), function() {
        subscribe(path(), jest.fn());
      });
    }).toThrowError("Cannot subscribe during an update or transaction");
  });

  test("trying to subscribe during an update throws", function() {
    const store = createStore(initialState);
    const { path, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    expect(function() {
      update(path(), function() {
        subscribe(path(), jest.fn());
      });
    }).toThrowError("Cannot subscribe during an update or transaction");
  });

  test("trying to subscribe during a transaction throws", function() {
    const store = createStore(initialState);
    const { path, transaction } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    expect(function() {
      transaction(function() {
        subscribe(path(), jest.fn());
      });
    }).toThrowError("Cannot subscribe during an update or transaction");
  });

  test("trying to unsubscribe during an update throws", function() {
    const store = createStore(initialState);
    const { path, update } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const unsubscribe = subscribe(path(), jest.fn());

    expect(function() {
      update(path(), function() {
        unsubscribe();
      });
    }).toThrowError("Cannot unsubscribe during an update or transaction");
  });

  test("trying to unsubscribe during a transaction throws", function() {
    const store = createStore(initialState);
    const { path, transaction } = store;
    const startReactiveCollection = createReactiveCollection(store);
    const subscribe = startReactiveCollection();

    const unsubscribe = subscribe(path(), jest.fn());

    expect(function() {
      transaction(function() {
        unsubscribe();
      });
    }).toThrowError("Cannot unsubscribe during an update or transaction");
  });
});
