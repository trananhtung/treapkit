# treapkit

<!-- ALL-CONTRIBUTORS-BADGE:START --><!-- ALL-CONTRIBUTORS-BADGE:END -->
[![npm version](https://img.shields.io/npm/v/treapkit.svg)](https://www.npmjs.com/package/treapkit)
[![npm downloads](https://img.shields.io/npm/dm/treapkit.svg)](https://www.npmjs.com/package/treapkit)
[![CI](https://img.shields.io/github/actions/workflow/status/trananhtung/treapkit/ci.yml?branch=main)](https://github.com/trananhtung/treapkit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero-dependency ordered set, map, and multiset with O(log n) operations and order statistics — TypeScript-first npm equivalent of Java `TreeSet`/`TreeMap`, Python `SortedList`, C# `SortedSet<T>`, Go treap.**

```ts
import { TreapSet, TreapMap, TreapMultiSet } from "treapkit";

// Ordered set with order statistics
const s = new TreapSet<number>();
s.add(5, 3, 1, 4, 2);
s.rank(4);      // 3  — three elements smaller than 4
s.select(0);    // 1  — smallest element
s.floor(3.5);   // 3  — largest element ≤ 3.5
s.ceiling(3.5); // 4  — smallest element ≥ 3.5
[...s];         // [1, 2, 3, 4, 5]  — always sorted

// Ordered map
const m = new TreapMap<string, number>();
m.set("c", 3).set("a", 1).set("b", 2);
[...m.keys()];       // ["a", "b", "c"]
m.floorKey("ba");    // "b"
m.higherKey("b");    // "c"

// Multiset (ordered, allows duplicates)
const ms = new TreapMultiSet<number>();
ms.add(3, 1, 2, 3, 1);
ms.count(3);    // 2
[...ms];        // [1, 1, 2, 3, 3]
ms.rank(2);     // 2  — two elements < 2
```

## Why treapkit?

Every major language ships an ordered set/map in its standard library:
- **Python**: `sortedcontainers.SortedList`, `SortedDict` (3rd party but standard)
- **Java**: `java.util.TreeSet`, `java.util.TreeMap` (stdlib)
- **C#**: `System.Collections.Generic.SortedSet<T>`, `SortedDictionary<K,V>`
- **Go**: `github.com/emirpasic/gods/sets/treeset`
- **Ruby**: `rbtree` gem

JavaScript's native `Set`/`Map` give O(1) average but **no ordering** — you can't find the floor/ceiling, rank, or k-th element. The only npm `treap` package was published in **2013**, receives **32 downloads per week**, and has no TypeScript support.

## Install

```bash
npm install treapkit
```

## Usage

### TreapSet

```ts
import { TreapSet } from "treapkit";

const s = new TreapSet<number>();
s.add(5, 3, 1, 4, 2);

// Core
s.has(3);    // true
s.delete(3); // true
s.size;      // 4
s.isEmpty;   // false

// Always iterates in ascending order
[...s];        // [1, 2, 4, 5]
s.toArray();   // same

// Order statistics — all O(log n)
s.rank(4);    // 2  (elements < 4: 1, 2)
s.select(0);  // 1  (smallest)
s.select(3);  // 5  (largest)
s.min();      // 1
s.max();      // 5

// Neighbor queries — all O(log n)
s.floor(3);    // 2  (largest ≤ 3)
s.ceiling(3);  // 4  (smallest ≥ 3)
s.lower(4);    // 2  (largest < 4)
s.higher(4);   // 5  (smallest > 4)

// Range queries — O(log n)
s.countRange(2, 5); // 3  (elements in [2, 5])
[...s.range(2, 4)]; // [2, 4]

// Custom comparator (sort by string length, then alpha)
const byLen = new TreapSet<string>((a, b) => a.length - b.length || a.localeCompare(b));
byLen.add("banana", "fig", "apple", "kiwi");
[...byLen]; // ["fig", "kiwi", "apple", "banana"]

// Construct from iterable
const s2 = new TreapSet<number>(undefined, [5, 3, 1, 4, 2]);
```

### TreapMap

```ts
import { TreapMap } from "treapkit";

const m = new TreapMap<string, number>();
m.set("c", 3).set("a", 1).set("b", 2);

m.get("b");     // 2
m.has("d");     // false
m.delete("b");  // true
m.size;         // 2

// Sorted iteration
[...m.keys()];    // ["a", "c"]
[...m.values()];  // [1, 3]
[...m.entries()]; // [["a",1],["c",3]]
[...m];           // same as entries

// Key navigation — O(log n)
m.minKey();         // "a"
m.maxKey();         // "c"
m.ceilingKey("b");  // "c"
m.floorKey("b");    // "a"
m.lowerKey("c");    // "a"
m.higherKey("a");   // "c"

// Order statistics on keys
m.rankKey("c");     // 1  (one key < "c")
m.selectKey(0);     // "a"  (0th key)

// Range
[...m.range("a", "b")]; // [["a",1]]

// Construct from entries
const m2 = new TreapMap<number, string>(
  (a, b) => a - b,          // numeric comparator
  [[1, "one"], [2, "two"]]  // seed entries
);
```

### TreapMultiSet

```ts
import { TreapMultiSet } from "treapkit";

const ms = new TreapMultiSet<number>();
ms.add(3, 1, 2, 3, 1);

// Allows duplicates
ms.size;       // 5
ms.count(1);   // 2
ms.count(3);   // 2
[...ms];       // [1, 1, 2, 3, 3]  — sorted, duplicates preserved

// Remove one occurrence
ms.delete(3);  // true
ms.count(3);   // 1

// Remove all occurrences
ms.deleteAll(1); // 2 (number removed)
ms.has(1);       // false

// All TreapSet queries work (rank, select, floor, ceiling, etc.)
ms.rank(3);         // number of elements < 3
ms.countRange(1,3); // count in [1, 3]
```

## API

### TreapSet\<T\>

| Method | Description |
|--------|-------------|
| `new TreapSet(cmp?, items?)` | Constructor. |
| `.add(...values)` | Add values. Duplicate ignored. Chainable. |
| `.delete(value)` | Remove. Returns `true` if existed. |
| `.has(value)` | Membership test. O(log n). |
| `.clear()` | Remove all. |
| `.rank(value)` | Elements strictly less than value. O(log n). |
| `.select(k)` | k-th smallest (0-indexed). O(log n). |
| `.floor(target)` | Largest element ≤ target. O(log n). |
| `.ceiling(target)` | Smallest element ≥ target. O(log n). |
| `.lower(target)` | Largest element < target. O(log n). |
| `.higher(target)` | Smallest element > target. O(log n). |
| `.min()` / `.max()` | Min/max element. O(log n). |
| `.countRange(lo, hi)` | Count in [lo, hi]. O(log n). |
| `.range(lo, hi)` | Iterate [lo, hi]. O(k + log n). |
| `[Symbol.iterator]` | Ascending iteration. |
| `.size` / `.isEmpty` | Count / emptiness. |

### TreapMap\<K, V\>

Same ordering features as TreapSet, plus:

| Method | Description |
|--------|-------------|
| `.set(key, value)` | Insert or update. Chainable. |
| `.get(key)` | Value or `undefined`. |
| `.keys()` / `.values()` / `.entries()` | Sorted generators. |
| `.minKey()` / `.maxKey()` | Boundary keys. |
| `.minValue()` / `.maxValue()` | Values at boundary keys. |
| `.rankKey(k)` / `.selectKey(n)` | Order stats on keys. |
| `.ceilingKey(k)` / `.floorKey(k)` / `.lowerKey(k)` / `.higherKey(k)` | Neighbor keys. |
| `.range(lo, hi)` | Iterate entries in key range. |

### TreapMultiSet\<T\>

All `TreapSet` methods, plus:

| Method | Description |
|--------|-------------|
| `.count(value)` | Number of occurrences. O(log n). |
| `.delete(value)` | Remove ONE occurrence. |
| `.deleteAll(value)` | Remove ALL occurrences. Returns count. |

## Complexity

| Operation | All classes |
|-----------|-------------|
| Insert | O(log n) expected |
| Delete | O(log n) expected |
| Lookup | O(log n) expected |
| Floor/Ceiling/Lower/Higher | O(log n) |
| Rank / Select | O(log n) |
| CountRange | O(log n) |
| In-order iteration | O(n) |
| Build from n items | O(n log n) |

Space: O(n).

A treap (randomized BST) achieves O(log n) expected height with no rotations, using random priorities to maintain the heap property.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START --><!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT © [trananhtung](https://github.com/trananhtung)
