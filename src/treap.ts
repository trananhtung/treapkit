export type Comparator<T> = (a: T, b: T) => number;

export const defaultCmp = <T>(a: T, b: T): number =>
  a < b ? -1 : a > b ? 1 : 0;

// ─── Node ─────────────────────────────────────────────────────────────────────

export class TreapNode<T> {
  key: T;
  priority: number;
  size: number;
  left: TreapNode<T> | null;
  right: TreapNode<T> | null;

  constructor(key: T) {
    this.key = key;
    this.priority = Math.random();
    this.size = 1;
    this.left = null;
    this.right = null;
  }
}

function sz<T>(n: TreapNode<T> | null): number {
  return n === null ? 0 : n.size;
}

function pull<T>(n: TreapNode<T>): void {
  n.size = 1 + sz(n.left) + sz(n.right);
}

// ─── Core split / merge ───────────────────────────────────────────────────────

/**
 * Split the treap rooted at `n` into two treaps:
 * - left: all keys < splitKey (or <= splitKey if inclusive=true)
 * - right: all keys >= splitKey (or > splitKey if inclusive=true)
 */
export function split<T>(
  n: TreapNode<T> | null,
  splitKey: T,
  cmp: Comparator<T>,
  inclusive = false
): [TreapNode<T> | null, TreapNode<T> | null] {
  if (n === null) return [null, null];
  const c = cmp(n.key, splitKey);
  const goLeft = inclusive ? c <= 0 : c < 0;
  if (goLeft) {
    const [l, r] = split(n.right, splitKey, cmp, inclusive);
    n.right = l;
    pull(n);
    return [n, r];
  } else {
    const [l, r] = split(n.left, splitKey, cmp, inclusive);
    n.left = r;
    pull(n);
    return [l, n];
  }
}

/** Merge two treaps where every key in left <= every key in right. */
export function merge<T>(
  left: TreapNode<T> | null,
  right: TreapNode<T> | null
): TreapNode<T> | null {
  if (left === null) return right;
  if (right === null) return left;
  if (left.priority > right.priority) {
    left.right = merge(left.right, right);
    pull(left);
    return left;
  } else {
    right.left = merge(left, right.left);
    pull(right);
    return right;
  }
}

// ─── High-level operations ────────────────────────────────────────────────────

export function find<T>(
  n: TreapNode<T> | null,
  key: T,
  cmp: Comparator<T>
): TreapNode<T> | null {
  while (n !== null) {
    const c = cmp(key, n.key);
    if (c === 0) return n;
    n = c < 0 ? n.left : n.right;
  }
  return null;
}

/** Insert key into treap. Returns new root. Allows duplicates if allowDup=true. */
export function insert<T>(
  root: TreapNode<T> | null,
  key: T,
  cmp: Comparator<T>,
  allowDup = false
): TreapNode<T> {
  if (!allowDup && find(root, key, cmp) !== null) return root!;
  const node = new TreapNode(key);
  const [l, r] = split(root, key, cmp, false);
  return merge(merge(l, node), r)!;
}

/** Remove one occurrence of key from treap. Returns new root. */
export function remove<T>(
  root: TreapNode<T> | null,
  key: T,
  cmp: Comparator<T>
): TreapNode<T> | null {
  if (root === null) return null;
  const c = cmp(key, root.key);
  if (c < 0) {
    root.left = remove(root.left, key, cmp);
    pull(root);
  } else if (c > 0) {
    root.right = remove(root.right, key, cmp);
    pull(root);
  } else {
    return merge(root.left, root.right);
  }
  return root;
}

/**
 * Return the 0-based rank of key: number of elements strictly less than key.
 * Works correctly even when duplicate keys appear in left subtrees (multiset).
 */
export function rank<T>(
  root: TreapNode<T> | null,
  key: T,
  cmp: Comparator<T>
): number {
  let r = 0;
  let n = root;
  while (n !== null) {
    const c = cmp(key, n.key);
    if (c > 0) {
      r += 1 + sz(n.left);
      n = n.right;
    } else {
      // c <= 0: n.key >= key, so go left (counts only elements < key)
      n = n.left;
    }
  }
  return r;
}

/** Return the k-th smallest element (0-indexed). Returns undefined if k OOB. */
export function select<T>(
  root: TreapNode<T> | null,
  k: number
): T | undefined {
  let n = root;
  while (n !== null) {
    const leftSz = sz(n.left);
    if (k < leftSz) {
      n = n.left;
    } else if (k === leftSz) {
      return n.key;
    } else {
      k -= leftSz + 1;
      n = n.right;
    }
  }
  return undefined;
}

/** Find the largest key <= target. Returns undefined if none. */
export function floor<T>(
  root: TreapNode<T> | null,
  target: T,
  cmp: Comparator<T>
): T | undefined {
  let result: T | undefined;
  let n = root;
  while (n !== null) {
    const c = cmp(n.key, target);
    if (c <= 0) {
      result = n.key;
      n = n.right;
    } else {
      n = n.left;
    }
  }
  return result;
}

/** Find the smallest key >= target. Returns undefined if none. */
export function ceiling<T>(
  root: TreapNode<T> | null,
  target: T,
  cmp: Comparator<T>
): T | undefined {
  let result: T | undefined;
  let n = root;
  while (n !== null) {
    const c = cmp(n.key, target);
    if (c >= 0) {
      result = n.key;
      n = n.left;
    } else {
      n = n.right;
    }
  }
  return result;
}

/** Find the largest key strictly < target. */
export function lower<T>(
  root: TreapNode<T> | null,
  target: T,
  cmp: Comparator<T>
): T | undefined {
  let result: T | undefined;
  let n = root;
  while (n !== null) {
    if (cmp(n.key, target) < 0) {
      result = n.key;
      n = n.right;
    } else {
      n = n.left;
    }
  }
  return result;
}

/** Find the smallest key strictly > target. */
export function higher<T>(
  root: TreapNode<T> | null,
  target: T,
  cmp: Comparator<T>
): T | undefined {
  let result: T | undefined;
  let n = root;
  while (n !== null) {
    if (cmp(n.key, target) > 0) {
      result = n.key;
      n = n.left;
    } else {
      n = n.right;
    }
  }
  return result;
}

/** In-order traversal generator. */
export function* inOrder<T>(root: TreapNode<T> | null): Generator<T> {
  if (root === null) return;
  yield* inOrder(root.left);
  yield root.key;
  yield* inOrder(root.right);
}

/**
 * Count elements <= value (works for multisets with duplicates).
 * O(log n).
 */
export function countLeq<T>(
  root: TreapNode<T> | null,
  value: T,
  cmp: Comparator<T>
): number {
  let count = 0;
  let n = root;
  while (n !== null) {
    if (cmp(n.key, value) <= 0) {
      count += sz(n.left) + 1;
      n = n.right;
    } else {
      n = n.left;
    }
  }
  return count;
}

/**
 * Count elements in [lo, hi] inclusive. Works for both sets and multisets.
 * = countLeq(hi) - rank(lo)
 */
export function countRange<T>(
  root: TreapNode<T> | null,
  lo: T,
  hi: T,
  cmp: Comparator<T>
): number {
  if (cmp(lo, hi) > 0) return 0;
  return countLeq(root, hi, cmp) - rank(root, lo, cmp);
}

export function minNode<T>(root: TreapNode<T> | null): T | undefined {
  if (root === null) return undefined;
  while (root.left !== null) root = root.left;
  return root.key;
}

export function maxNode<T>(root: TreapNode<T> | null): T | undefined {
  if (root === null) return undefined;
  while (root.right !== null) root = root.right;
  return root.key;
}
