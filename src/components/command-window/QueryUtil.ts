export function isNumeric(n: string): boolean {
  const parsed = parseFloat(n);
  return !isNaN(parsed) && isFinite(parsed);
}
