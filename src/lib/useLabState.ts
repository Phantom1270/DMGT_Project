import { useState, type Dispatch, type SetStateAction } from "react";
const memory = new Map<string, unknown>();
/** In-memory module state survives tab unmounts and clears on page reload. */
export function useLabState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    memory.has(key) ? (memory.get(key) as T) : initial,
  );
  const update: Dispatch<SetStateAction<T>> = (next) =>
    setValue((previous) => {
      const value =
        typeof next === "function" ? (next as (p: T) => T)(previous) : next;
      memory.set(key, value);
      return value;
    });
  return [value, update];
}
