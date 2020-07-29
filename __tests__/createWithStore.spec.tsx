import { createStore } from "@gact/store";

import { createUseValue } from "../src/createUseValue";
import { createWithStore } from "../src/createWithStore";

describe("createUseValue", function() {
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

  test("withStore calls the provided consumer with reactStore", function() {
    const store = createStore(initialState);
    const useValue = createUseValue(store);
    const reactStore = { ...store, useValue };
    const withStore = createWithStore(reactStore);

    const consumer = jest.fn();

    withStore(consumer);

    expect(consumer).toHaveBeenCalledWith(reactStore);
  });
});
