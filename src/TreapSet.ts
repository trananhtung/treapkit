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
  countRange,
  minNode,
  maxNode,
} from "./treap.js";

/**
 * Ordered set backed by a randomized treap.
 *
 * All operations are O(log n) expected. Elements must be unique — duplicate
 * inserts are silently ignored.
 *
 * Equivalent to Java `TreeSet<E>`, Python `sortedcontainers.SortedSet`,
 * C# `SortedSet<T>`, Go `github.com/emirpasic/gods/sets/treeset`.
 *
 * @example
 * const s = new TreapSet<number>();
 * s.add(5, 3, 1, 4, 2);
 * s.has(3);         // true
 * s.floor(3.5);     // 3
 * s.ceiling(3.5);   // 4
 * s.rank(4);        // 3 — three elements < 4
 * s.select(0);      // 1 — smallest
 * [...s];           // [1, 2, 3, 4, 5]
 */
export class TreapSet<T> {
  private _root: TreapNode<T> | null = null;
  private readonly _cmp: Comparator<T>;

  constructor(comparator?: Comparator<T>, items?: Iterable<T>) {
    this._cmp = comparator ?? defaultCmp;
    if (items) for (const x of items) this.add(x);
  }

  get size(): number { return this._root?.size ?? 0; }
  get isEmpty(): boolean { return this._root === null; }

  /** Add a value. O(log n). Duplicate is ignored. Returns this. */
  add(...values: T[]): this {
    for (const v of values) this._root = insert(this._root, v, this._cmp, false);
    return this;
  }

  /** Remove a value. O(log n). Returns true if it existed. */
  delete(value: T): boolean {
    if (!this.has(value)) return false;
    this._root = remove(this._root, value, this._cmp);
    return true;
  }

  /** Returns true if value is in the set. O(log n). */
  has(value: T): boolean { return find(this._root, value, this._cmp) !== null; }

  /** Remove all elements. */
  clear(): void { this._root = null; }

  // ── Order statistics ───────────────────────────────────────────────────────

  /** 0-based rank: number of elements strictly less than value. O(log n). */
  rank(value: T): number { return rank(this._root, value, this._cmp); }

  /** k-th smallest element (0-indexed). O(log n). Returns undefined if OOB. */
  select(k: number): T | undefined { return select(this._root, k); }

  /** Smallest element ≥ target. O(log n). */
  ceiling(target: T): T | undefined { return ceiling(this._root, target, this._cmp); }

  /** Largest element ≤ target. O(log n). */
  floor(target: T): T | undefined { return floor(this._root, target, this._cmp); }

  /** Largest element strictly < target. O(log n). */
  lower(target: T): T | undefined { return lower(this._root, target, this._cmp); }

  /** Smallest element strictly > target. O(log n). */
  higher(target: T): T | undefined { return higher(this._root, target, this._cmp); }

  /** Count of elements in [lo, hi] inclusive. O(log n). */
  countRange(lo: T, hi: T): number { return countRange(this._root, lo, hi, this._cmp); }

  /** Minimum element. O(log n). */
  min(): T | undefined { return minNode(this._root); }

  /** Maximum element. O(log n). */
  max(): T | undefined { return maxNode(this._root); }

  // ── Iteration ──────────────────────────────────────────────────────────────

  [Symbol.iterator](): Iterator<T> { return inOrder(this._root); }

  /** Iterate elements in [lo, hi] inclusive in ascending order. O(k + log n). */
  *range(lo: T, hi: T): Generator<T> {
    for (const x of inOrder(this._root)) {
      const cl = this._cmp(x, lo);
      const ch = this._cmp(x, hi);
      if (cl >= 0 && ch <= 0) yield x;
      else if (ch > 0) break;
    }
  }

  toArray(): T[] { return [...this]; }

  toString(): string { return `TreapSet(${this.size})`; }
}
