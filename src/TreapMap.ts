import {
  TreapNode,
  Comparator,
  defaultCmp,
  find,
  insert,
  remove,
  rank,
  select,
  floor,
  ceiling,
  lower,
  higher,
  inOrder,
  minNode,
  maxNode,
} from "./treap.js";

interface KVNode<K, V> { key: K; value: V }

function kvCmp<K, V>(cmp: Comparator<K>): Comparator<KVNode<K, V>> {
  return (a, b) => cmp(a.key, b.key);
}

/**
 * Ordered map backed by a randomized treap.
 *
 * All operations are O(log n) expected. Keys must be unique — setting an
 * existing key updates its value.
 *
 * Equivalent to Java `TreeMap<K,V>`, Python `sortedcontainers.SortedDict`,
 * C# `SortedDictionary<K,V>`, Go `treemap.Map`.
 *
 * @example
 * const m = new TreapMap<string, number>();
 * m.set("c", 3).set("a", 1).set("b", 2);
 * m.get("b");         // 2
 * m.ceilingKey("b");  // "b"
 * m.higherKey("b");   // "c"
 * m.floorKey("ba");   // "b"
 * [...m.keys()];      // ["a", "b", "c"]
 */
export class TreapMap<K, V> {
  private _root: TreapNode<KVNode<K, V>> | null = null;
  private readonly _cmp: Comparator<KVNode<K, V>>;
  private readonly _keyCmp: Comparator<K>;

  constructor(comparator?: Comparator<K>, entries?: Iterable<[K, V]>) {
    this._keyCmp = comparator ?? defaultCmp;
    this._cmp = kvCmp(this._keyCmp);
    if (entries) for (const [k, v] of entries) this.set(k, v);
  }

  get size(): number { return this._root?.size ?? 0; }
  get isEmpty(): boolean { return this._root === null; }

  private _probe(key: K): KVNode<K, V> { return { key, value: undefined as V }; }

  /** Set key → value. O(log n). Returns this. */
  set(key: K, value: V): this {
    // Remove existing key first to handle update
    const existing = find(this._root, this._probe(key), this._cmp);
    if (existing !== null) {
      existing.key.value = value;
      return this;
    }
    this._root = insert(this._root, { key, value }, this._cmp, false);
    return this;
  }

  /** Get value for key. O(log n). Returns undefined if not found. */
  get(key: K): V | undefined {
    return find(this._root, this._probe(key), this._cmp)?.key.value;
  }

  /** Returns true if key exists. O(log n). */
  has(key: K): boolean { return find(this._root, this._probe(key), this._cmp) !== null; }

  /** Delete a key. O(log n). Returns true if it existed. */
  delete(key: K): boolean {
    if (!this.has(key)) return false;
    this._root = remove(this._root, this._probe(key), this._cmp);
    return true;
  }

  /** Remove all entries. */
  clear(): void { this._root = null; }

  // ── Order statistics ───────────────────────────────────────────────────────

  /** 0-based rank of key (elements with smaller keys). O(log n). */
  rankKey(key: K): number { return rank(this._root, this._probe(key), this._cmp); }

  /** k-th smallest key (0-indexed). O(log n). Returns undefined if OOB. */
  selectKey(k: number): K | undefined { return select(this._root, k)?.key; }

  /** Smallest key ≥ target. O(log n). */
  ceilingKey(target: K): K | undefined {
    return ceiling(this._root, this._probe(target), this._cmp)?.key;
  }

  /** Largest key ≤ target. O(log n). */
  floorKey(target: K): K | undefined {
    return floor(this._root, this._probe(target), this._cmp)?.key;
  }

  /** Largest key strictly < target. O(log n). */
  lowerKey(target: K): K | undefined {
    return lower(this._root, this._probe(target), this._cmp)?.key;
  }

  /** Smallest key strictly > target. O(log n). */
  higherKey(target: K): K | undefined {
    return higher(this._root, this._probe(target), this._cmp)?.key;
  }

  /** Minimum key. O(log n). */
  minKey(): K | undefined { return minNode(this._root)?.key; }

  /** Maximum key. O(log n). */
  maxKey(): K | undefined { return maxNode(this._root)?.key; }

  /** Value at the minimum key. */
  minValue(): V | undefined { return minNode(this._root)?.value; }

  /** Value at the maximum key. */
  maxValue(): V | undefined { return maxNode(this._root)?.value; }

  // ── Iteration (all in ascending key order) ─────────────────────────────────

  *keys(): Generator<K> {
    for (const kv of inOrder(this._root)) yield kv.key;
  }

  *values(): Generator<V> {
    for (const kv of inOrder(this._root)) yield kv.value;
  }

  *entries(): Generator<[K, V]> {
    for (const kv of inOrder(this._root)) yield [kv.key, kv.value];
  }

  [Symbol.iterator](): Iterator<[K, V]> { return this.entries(); }

  /** Iterate entries whose keys are in [lo, hi] inclusive. O(k + log n). */
  *range(lo: K, hi: K): Generator<[K, V]> {
    for (const kv of inOrder(this._root)) {
      const cl = this._keyCmp(kv.key, lo);
      const ch = this._keyCmp(kv.key, hi);
      if (cl >= 0 && ch <= 0) yield [kv.key, kv.value];
      else if (ch > 0) break;
    }
  }

  toObject(): Record<string, V> {
    const obj: Record<string, V> = {};
    for (const [k, v] of this) obj[String(k)] = v;
    return obj;
  }

  toString(): string { return `TreapMap(${this.size})`; }
}
