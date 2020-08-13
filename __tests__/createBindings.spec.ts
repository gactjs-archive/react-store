import { createStore } from "@gact/store";
import { createBindings } from "../src";

describe("createBindings", function() {
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

  test("createBindings", function() {
    const store = createStore(initialState);
    const bindings = createBindings(store);

    expect(bindings).toHaveProperty("useValue");
    expect(bindings).toHaveProperty("withStore");
    expect(Object.keys(bindings).length).toBe(2);
  });
});
