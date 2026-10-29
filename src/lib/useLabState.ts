import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useSession } from "./sessionStore";
/** Module input ownership lives in the session store; only theme preferences persist on disk. */
export function useLabState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const stored = useSession((s) => s.values[key]);
  const update = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      const state = useSession.getState();
      const previous = (key in state.values ? state.values[key] : initial) as T;
      state.setValue(
        key,
        typeof next === "function" ? (next as (p: T) => T)(previous) : next,
      );
    },
    [key, initial],
  );
  return [stored === undefined ? initial : (stored as T), update];
}
