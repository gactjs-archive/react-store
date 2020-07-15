// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { createStore } from "@gact/store";
import { renderHook, act } from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";

import { createUseValue } from "../src/createUseValue";

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

  test("create useValue", function() {
    expect(function() {
      const store = createStore(initialState);

      createUseValue(store);
    }).not.toThrowError();
  });

  test("returns the requested value", function() {
    const store = createStore(initialState);
    const { path, update } = store;
    const useValue = createUseValue(store);

    const res = renderHook(() => useValue(path("a")));
    const { result } = res;
    expect(result.current).toBe("a");

    act(function() {
      update(path("a"), (a) => a + "a");
    });

    expect(result.current).toBe("aa");
  });

  test("returns the transformed value", function() {
    const store = createStore(initialState);
    const useValue = createUseValue(store);
    const { path, update } = store;

    const res = renderHook(() => useValue(path("a"), (a) => a.length));
    const { result } = res;
    expect(result.current).toBe(1);

    act(function() {
      update(path("a"), (a) => a + "a");
    });

    expect(result.current).toBe(2);
  });

  test("uses Object.is equality to prevent unnecessary renders", function() {
    const store = createStore(initialState);
    const useValue = createUseValue(store);
    const { path, set } = store;
    const renderedItems: Array<string> = [];

    function Comp() {
      const value = useValue(path("a"));

      renderedItems.push(value);

      return <div />;
    }

    rtl.render(<Comp />);

    expect(renderedItems).toHaveLength(1);

    set(path("a"), "a");

    expect(renderedItems).toHaveLength(1);
  });

  test("uses transformed value for Object.is equality to prevent unnecessary renders", function() {
    const store = createStore(initialState);
    const useValue = createUseValue(store);
    const { path, set } = store;
    const renderedItems: Array<number> = [];

    function Comp() {
      const value = useValue(path("a"), (a) => a.length);

      renderedItems.push(value);

      return <div />;
    }

    rtl.render(<Comp />);

    expect(renderedItems).toHaveLength(1);

    set(path("a"), "b");

    expect(renderedItems).toHaveLength(1);
  });
});
