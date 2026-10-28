export type Gate = {
  id: string;
  label: string;
  kind: "input" | "AND" | "OR";
  sources: string[];
  value: boolean;
};
export const inputGate = (id: string, value: boolean): Gate => ({
  id,
  label: id,
  kind: "input",
  sources: [],
  value,
});
export const gate = (
  id: string,
  kind: "AND" | "OR",
  sources: string[],
  value: boolean,
): Gate => ({ id, label: id, kind, sources, value });
