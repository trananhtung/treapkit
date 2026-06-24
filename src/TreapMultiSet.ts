import {
  TreapNode,
  Comparator,
  defaultCmp,
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
  countLeq,
  minNode,
  maxNode,
} from "./treap.js";

/**
 * Ordered multiset — like TreapSet but allows duplicate values.
 *
 * Equivalent to Java `TreeMultiset` (Guava), Python `SortedList` (which allows
 * duplicates), C# sorted-list with duplicates.
 *
 * @example
 * const ms = new TreapMultiSet<number>();
 * ms.add(3, 1, 2, 3, 1);
 * ms.count(1);      // 2
 * ms.count(3);      // 2
 * ms.size;          // 5
 * [...ms];          // [1, 1, 2, 3, 3]
 */
export class TreapMultiSet<T> {
  private _root: TreapNode<T> | null = null;
  private readonly _cmp: Comparator<T>;

  constructor(comparator?: Comparator<T>, items?: Iterable<T>) {
    this._cmp = comparator ?? defaultCmp;
    if (items) for (const x of items) this.add(x);
  }

  get size(): number { return this._root?.size ?? 0; }
  get isEmpty(): boolean { return this._root === null; }

  /** Add a value (duplicates allowed). O(log n). Returns this. */
  add(...values: T[]): this {
    for (const v of values) this._root = insert(this._root, v, this._cmp, true);
    return this;
  }

  /** Remove one occurrence of value. O(log n). Returns true if found. */
  delete(value: T): boolean {
    const before = this.size;
    this._root = remove(this._root, value, this._cmp);
    return this.size < before;
  }

  /** Count occurrences of value. O(log n). */
  count(value: T): number {
    return countLeq(this._root, value, this._cmp) - rank(this._root, value, this._cmp);
  }

  /** Returns true if at least one occurrence exists. O(log n). */
  has(value: T): boolean { return this.count(value) > 0; }

  /** Remove all occurrences of value. O(k log n). */
  deleteAll(value: T): number {
    let removed = 0;
    while (this.delete(value)) removed++;
    return removed;
  }

  clear(): void { this._root = null; }

  // ── Order statistics ────────────────────────────────────────────────────────

  rank(value: T): number { return rank(this._root, value, this._cmp); }
  select(k: number): T | undefined { return select(this._root, k); }
  ceiling(target: T): T | undefined { return ceiling(this._root, target, this._cmp); }
  floor(target: T): T | undefined { return floor(this._root, target, this._cmp); }
  lower(target: T): T | undefined { return lower(this._root, target, this._cmp); }
  higher(target: T): T | undefined { return higher(this._root, target, this._cmp); }
  countRange(lo: T, hi: T): number { return countRange(this._root, lo, hi, this._cmp); }
  min(): T | undefined { return minNode(this._root); }
  max(): T | undefined { return maxNode(this._root); }

  [Symbol.iterator](): Iterator<T> { return inOrder(this._root); }
  toArray(): T[] { return [...this]; }
  toString(): string { return `TreapMultiSet(${this.size})`; }
}
