import { useLabState } from "../../lib/useLabState";
import type { Work } from "../../lib/analysis";
import { UNDO_LIMIT } from "../../lib/constants";
export function useProject(key: string, sample: Work[]) {
  const [items, setItems] = useLabState(key, sample),
    [past, setPast] = useLabState<Work[][]>(key + "-past", []),
    [future, setFuture] = useLabState<Work[][]>(key + "-future", []);
  const edit = (next: Work[]) => {
    setPast([...past.slice(-(UNDO_LIMIT - 1)), items]);
    setFuture([]);
    setItems(next);
  };
  const undo = () => {
    if (!past.length) return;
    setFuture([items, ...future]);
    setItems(past[past.length - 1]);
    setPast(past.slice(0, -1));
  };
  const redo = () => {
    if (!future.length) return;
    setPast([...past, items]);
    setItems(future[0]);
    setFuture(future.slice(1));
  };
  return { items, edit, undo, redo, past, future };
}
