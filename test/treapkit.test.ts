import { TreapSet, TreapMap, TreapMultiSet } from "../src/index.js";

// ────────────────────────────────────────────────────────────────
// TreapSet
// ────────────────────────────────────────────────────────────────
describe("TreapSet", () => {
  test("add and has", () => {
    const s = new TreapSet<number>();
    s.add(5, 3, 1, 4, 2);
    expect(s.has(3)).toBe(true);
    expect(s.has(6)).toBe(false);
    expect(s.size).toBe(5);
  });

  test("duplicate add is ignored", () => {
    const s = new TreapSet<number>();
    s.add(1).add(1).add(1);
    expect(s.size).toBe(1);
  });

  test("delete existing", () => {
    const s = new TreapSet<number>(undefined, [1, 2, 3]);
    expect(s.delete(2)).toBe(true);
    expect(s.has(2)).toBe(false);
    expect(s.size).toBe(2);
  });

  test("delete non-existent returns false", () => {
    const s = new TreapSet<number>(undefined, [1, 2, 3]);
    expect(s.delete(99)).toBe(false);
  });

  test("iterates in ascending order", () => {
    const s = new TreapSet<number>(undefined, [5, 3, 1, 4, 2]);
    expect([...s]).toEqual([1, 2, 3, 4, 5]);
  });

  test("clear", () => {
    const s = new TreapSet<number>(undefined, [1, 2, 3]);
    s.clear();
    expect(s.size).toBe(0);
    expect(s.isEmpty).toBe(true);
  });

  describe("order statistics", () => {
    const s = new TreapSet<number>(undefined, [10, 30, 20, 40, 50]);

    test("rank", () => {
      expect(s.rank(10)).toBe(0); // 0 elements < 10
      expect(s.rank(20)).toBe(1);
      expect(s.rank(30)).toBe(2);
      expect(s.rank(50)).toBe(4);
    });

    test("select", () => {
      expect(s.select(0)).toBe(10);
      expect(s.select(2)).toBe(30);
      expect(s.select(4)).toBe(50);
      expect(s.select(5)).toBeUndefined();
    });

    test("floor", () => {
      expect(s.floor(25)).toBe(20);
      expect(s.floor(20)).toBe(20);
      expect(s.floor(5)).toBeUndefined();
    });

    test("ceiling", () => {
      expect(s.ceiling(25)).toBe(30);
      expect(s.ceiling(30)).toBe(30);
      expect(s.ceiling(55)).toBeUndefined();
    });

    test("lower (strictly less)", () => {
      expect(s.lower(30)).toBe(20);
      expect(s.lower(10)).toBeUndefined();
    });

    test("higher (strictly greater)", () => {
      expect(s.higher(30)).toBe(40);
      expect(s.higher(50)).toBeUndefined();
    });

    test("min and max", () => {
      expect(s.min()).toBe(10);
      expect(s.max()).toBe(50);
    });

    test("countRange", () => {
      expect(s.countRange(20, 40)).toBe(3); // 20,30,40
      expect(s.countRange(10, 50)).toBe(5);
      expect(s.countRange(25, 35)).toBe(1); // 30
      expect(s.countRange(60, 70)).toBe(0);
    });
  });

  test("range iteration", () => {
    const s = new TreapSet<number>(undefined, [1, 2, 3, 4, 5, 6, 7]);
    expect([...s.range(3, 5)]).toEqual([3, 4, 5]);
  });

  test("custom comparator (descending)", () => {
    const s = new TreapSet<number>((a, b) => b - a, [1, 3, 2]);
    expect([...s]).toEqual([3, 2, 1]);
    expect(s.min()).toBe(3); // "min" under reversed order
  });

  test("string set", () => {
    const s = new TreapSet<string>(undefined, ["banana", "apple", "cherry"]);
    expect([...s]).toEqual(["apple", "banana", "cherry"]);
    expect(s.floor("avocado")).toBe("apple");
    expect(s.ceiling("avocado")).toBe("banana");
  });

  test("large random set is sorted", () => {
    const vals = Array.from({ length: 500 }, () => Math.floor(Math.random() * 1000));
    const s = new TreapSet<number>(undefined, vals);
    const arr = [...s];
    const sorted = [...new Set(vals)].sort((a, b) => a - b);
    expect(arr).toEqual(sorted);
  });

  test("isEmpty", () => {
    const s = new TreapSet<number>();
    expect(s.isEmpty).toBe(true);
    s.add(1);
    expect(s.isEmpty).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────
// TreapMap
// ────────────────────────────────────────────────────────────────
describe("TreapMap", () => {
  test("set and get", () => {
    const m = new TreapMap<string, number>();
    m.set("c", 3).set("a", 1).set("b", 2);
    expect(m.get("a")).toBe(1);
    expect(m.get("b")).toBe(2);
    expect(m.get("d")).toBeUndefined();
  });

  test("update existing key", () => {
    const m = new TreapMap<string, number>();
    m.set("a", 1);
    m.set("a", 99);
    expect(m.get("a")).toBe(99);
    expect(m.size).toBe(1);
  });

  test("has and delete", () => {
    const m = new TreapMap<string, number>(undefined, [["a", 1], ["b", 2]]);
    expect(m.has("a")).toBe(true);
    expect(m.delete("a")).toBe(true);
    expect(m.has("a")).toBe(false);
    expect(m.delete("z")).toBe(false);
  });

  test("keys/values/entries in sorted order", () => {
    const m = new TreapMap<string, number>(undefined, [["c", 3], ["a", 1], ["b", 2]]);
    expect([...m.keys()]).toEqual(["a", "b", "c"]);
    expect([...m.values()]).toEqual([1, 2, 3]);
    expect([...m.entries()]).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });

  test("[Symbol.iterator] yields entries", () => {
    const m = new TreapMap<number, string>(undefined, [[2, "b"], [1, "a"]]);
    expect([...m]).toEqual([[1, "a"], [2, "b"]]);
  });

  test("range iteration", () => {
    const m = new TreapMap<number, string>(undefined, [[1,"a"],[2,"b"],[3,"c"],[4,"d"],[5,"e"]]);
    expect([...m.range(2, 4)]).toEqual([[2,"b"],[3,"c"],[4,"d"]]);
  });

  test("order statistics on keys", () => {
    const m = new TreapMap<number, string>(undefined, [[10,"a"],[20,"b"],[30,"c"],[40,"d"]]);
    expect(m.rankKey(20)).toBe(1);
    expect(m.selectKey(2)).toBe(30);
    expect(m.ceilingKey(15)).toBe(20);
    expect(m.floorKey(15)).toBe(10);
    expect(m.lowerKey(30)).toBe(20);
    expect(m.higherKey(30)).toBe(40);
    expect(m.minKey()).toBe(10);
    expect(m.maxKey()).toBe(40);
    expect(m.minValue()).toBe("a");
    expect(m.maxValue()).toBe("d");
  });

  test("clear", () => {
    const m = new TreapMap<string, number>(undefined, [["a", 1]]);
    m.clear();
    expect(m.size).toBe(0);
    expect(m.has("a")).toBe(false);
  });

  test("numeric key comparator", () => {
    const m = new TreapMap<number, string>((a, b) => a - b);
    m.set(3, "c").set(1, "a").set(2, "b");
    expect([...m.keys()]).toEqual([1, 2, 3]);
  });

  test("toObject", () => {
    const m = new TreapMap<string, number>(undefined, [["a", 1], ["b", 2]]);
    expect(m.toObject()).toEqual({ a: 1, b: 2 });
  });
});

// ────────────────────────────────────────────────────────────────
// TreapMultiSet
// ────────────────────────────────────────────────────────────────
describe("TreapMultiSet", () => {
  test("allows duplicates", () => {
    const ms = new TreapMultiSet<number>();
    ms.add(3, 1, 2, 3, 1);
    expect(ms.size).toBe(5);
    expect(ms.count(1)).toBe(2);
    expect(ms.count(3)).toBe(2);
    expect(ms.count(2)).toBe(1);
  });

  test("iterates in sorted order with duplicates", () => {
    const ms = new TreapMultiSet<number>(undefined, [3, 1, 2, 3, 1]);
    expect([...ms]).toEqual([1, 1, 2, 3, 3]);
  });

  test("delete removes one occurrence", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 1, 2]);
    ms.delete(1);
    expect(ms.count(1)).toBe(1);
    expect(ms.size).toBe(2);
  });

  test("deleteAll removes all occurrences", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 1, 1, 2]);
    expect(ms.deleteAll(1)).toBe(3);
    expect(ms.has(1)).toBe(false);
    expect(ms.size).toBe(1);
  });

  test("rank with duplicates", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 1, 2, 3]);
    // elements < 1: 0
    expect(ms.rank(1)).toBe(0);
    // elements < 2: 2 (both 1s)
    expect(ms.rank(2)).toBe(2);
  });

  test("select with duplicates", () => {
    const ms = new TreapMultiSet<number>(undefined, [3, 1, 1, 2]);
    expect(ms.select(0)).toBe(1);
    expect(ms.select(1)).toBe(1);
    expect(ms.select(2)).toBe(2);
    expect(ms.select(3)).toBe(3);
  });

  test("countRange with duplicates", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 1, 2, 3, 3, 4]);
    expect(ms.countRange(1, 3)).toBe(5); // 1,1,2,3,3
    expect(ms.countRange(3, 3)).toBe(2);
  });

  test("floor/ceiling/lower/higher", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 1, 3, 3, 5]);
    expect(ms.floor(2)).toBe(1);
    expect(ms.ceiling(2)).toBe(3);
    expect(ms.lower(3)).toBe(1);
    expect(ms.higher(3)).toBe(5);
  });

  test("min/max", () => {
    const ms = new TreapMultiSet<number>(undefined, [5, 1, 3, 1, 5]);
    expect(ms.min()).toBe(1);
    expect(ms.max()).toBe(5);
  });

  test("has", () => {
    const ms = new TreapMultiSet<number>(undefined, [2, 4]);
    expect(ms.has(2)).toBe(true);
    expect(ms.has(3)).toBe(false);
  });

  test("clear", () => {
    const ms = new TreapMultiSet<number>(undefined, [1, 2, 3]);
    ms.clear();
    expect(ms.size).toBe(0);
  });
});
