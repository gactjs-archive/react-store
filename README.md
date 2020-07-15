# React Store

![CircleCI](https://img.shields.io/circleci/build/github/gactjs/react-store?style=for-the-badge)
![Coveralls github](https://img.shields.io/coveralls/github/gactjs/react-store?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/gactjs/react-store?style=for-the-badge)
![npm](https://img.shields.io/npm/v/@gact/react-store?style=for-the-badge)
![npm bundle size](https://img.shields.io/bundlephobia/min/@gact/react-store?style=for-the-badge)

The official React bindings to the Gact store.

## API

### `createBindings(store)`

Creates React bindings for the provided Gact store.

#### Arguments

1. store (`Store`): the Gact store you want to bind to React

#### Returns

(`Bindings`): React bindings to the Gact store.

`Bindings` is an object that provides two functions:

- `useValue`: a hook to reactively consume values from the store
- `withStore`: a higher-order function that provides consumers with a `ReactStore`, which is the base Gact store extented with the `useValue` hook

#### Example

```ts
import { createStore } from "@gact/store";
import { createBindings } from "@gact/react-store";

type State = {
  count: number;
};

const initialState: State = {
  count: 0,
};

// create Gact store
const store = createStore(store);

// create React bindings to the Gact store
const { useValue, withStore } = createBindings(store);
```

### `useValue(path, [transformer])`

A hook to reactively read values from the store.

#### Arguments

1. path (`Path`): the path of the value you want read
2. transformer: (`Transformer`): converts a value in the store to one needed by the UI.

#### Returns

(`Value | T`): the value in the store at the provided path or the value returned by the transformer if specified

#### Example

```ts
import { PathFor } from "@gact/store";

import { useValue, State } from "store"

type Props = {
    countPath: PathFor<State, number>
}

function Counter({ countPath }: Props) {
    const count = useValue(countPath);
    const tenCount = useValue(countPath, c => c * 10);

    function increment() {
        update(countPath, c => c + 1);
    }

    function decrement() {
        update(countPath, c => c - 1);
    }

    return (
      <div>
        <p>count is {count}</p>
        <p>ten count is {tenCount}</p>
        <button onClick={decrement}>Decrement</button>
        <button onClick={increment}>Increment</button>
      </div>
    );
  };
}
```

### `withStore(consumer)`

A higher-order function that provides consumers with a `ReactStore`, which is the base Gact store extented with the
`useValue` hook.

`withStore` facilitates the **create component pattern**, which allows for the creation of encapsulated components.

#### Arugments

1. consumer (`StoreConsumer`): a function takes `ReactStore` as its only paramter

#### Returns

The value returned by the provided `StoreConsumer`

#### Example

Let's assume that someone built the following `Counter` and published it as an npm package:

```ts
import React from "react";
import { Store, StoreValue, PathFor } from "@gact/store";
import { ReactStore } from "@gact/react-store";

type Props<S extends StoreValue> = {
    countPath: PathFor<S, number>;
}

export default function createCounter<S extends StoreValue>({ update, useValue}: ReactStore<S>)) {
  return function Counter({ countPath }: Props<S>) {
    const count = useValue(countPath);

    function increment() {
        update(countPath, c => c + 1);
    }

    function decrement() {
        update(countPath, c => c - 1);
    }

    return (
      <div>
        {count}
        <button onClick={decrement}>Decrement</button>
        <button onClick={increment}>Increment</button>
      </div>
    );
  };
}
```

We can then make use of it in our React app as follows:

```ts
import createCounter from "...";

import { withStore, path } from "store";

const Counter = withStore(createCounter);

function App() {
  return <Counter countPath={path("count")} />;
}
```
