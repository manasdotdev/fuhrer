/**
 * Structural equality for selector outputs.
 * Mirrors TipTap React's default `deepEqual` behaviour for common
 * toolbar / menu snapshots (primitives, plain objects, arrays).
 */
export function structuralEquals<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i += 1) {
      if (!structuralEquals(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !structuralEquals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}
