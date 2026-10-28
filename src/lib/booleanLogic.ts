export type Bit = 0 | 1;
export const and = (a: Bit, b: Bit): Bit => (a && b ? 1 : 0);
export const or = (a: Bit, b: Bit): Bit => (a || b ? 1 : 0);
export const not = (a: Bit): Bit => (a ? 0 : 1);
export function generateTruthTable<T>(
  variables: string[],
  evaluator: (values: Record<string, Bit>) => T,
) {
  return Array.from({ length: 2 ** variables.length }, (_, row) => {
    const values = Object.fromEntries(
      variables.map((name, index) => [
        name,
        ((row >> (variables.length - index - 1)) & 1) as Bit,
      ]),
    ) as Record<string, Bit>;
    return { values, result: evaluator(values) };
  });
}
export function verifyEquivalence(
  variables: string[],
  first: (values: Record<string, Bit>) => Bit,
  second: (values: Record<string, Bit>) => Bit,
) {
  return generateTruthTable(
    variables,
    (values) => first(values) === second(values),
  ).every((row) => row.result);
}
