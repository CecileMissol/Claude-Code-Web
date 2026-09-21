/**
 * Immutable read/write of a value inside the invitation content, addressed by a
 * dot path (`couple.partner1.firstName`, `program.items.2.title`).
 *
 * Every field descriptor carries such a path, which is what lets the editor be
 * generated from the theme manifest instead of being written field by field.
 * Writes never mutate their input: React state stays comparable by reference.
 */

type Json = Record<string, unknown> | unknown[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Splits a path; an empty path addresses the root. */
export function pathSegments(path: string): string[] {
  return path.length === 0 ? [] : path.split('.');
}

/** Reads the value at `path`, or `undefined` when any step is missing. */
export function getAtPath(source: unknown, path: string): unknown {
  let current: unknown = source;

  for (const segment of pathSegments(path)) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
    } else if (isRecord(current)) {
      current = current[segment];
    } else {
      return undefined;
    }
    if (current === undefined) return undefined;
  }

  return current;
}

function cloneContainer(container: unknown, nextSegment: string | undefined): Json {
  if (Array.isArray(container)) return [...container];
  if (isRecord(container)) return { ...container };
  return nextSegment !== undefined && Number.isInteger(Number(nextSegment)) ? [] : {};
}

function write(container: Json, segment: string, value: unknown): void {
  if (Array.isArray(container)) {
    const index = Number(segment);
    if (value === undefined) container.splice(index, 1);
    else container[index] = value;
    return;
  }

  if (value === undefined) delete (container as Record<string, unknown>)[segment];
  else (container as Record<string, unknown>)[segment] = value;
}

/**
 * Returns a copy of `source` with `path` set to `value`.
 * Passing `undefined` removes the key (or splices the array item), which is how
 * optional fields — a directions URL, a theme extra — are cleared.
 */
export function setAtPath<T>(source: T, path: string, value: unknown): T {
  const segments = pathSegments(path);
  if (segments.length === 0) return value as T;

  const root = cloneContainer(source, segments[0]);
  let container: Json = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i] as string;
    const child = Array.isArray(container)
      ? container[Number(segment)]
      : (container as Record<string, unknown>)[segment];
    const copy = cloneContainer(child, segments[i + 1]);
    write(container, segment, copy);
    container = copy;
  }

  write(container, segments[segments.length - 1] as string, value);
  return root as T;
}

/** Applies several writes in one pass. */
export function setManyAtPath<T>(source: T, updates: Record<string, unknown>): T {
  return Object.entries(updates).reduce<T>(
    (accumulator, [path, value]) => setAtPath(accumulator, path, value),
    source,
  );
}
