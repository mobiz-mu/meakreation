export function mur(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `Rs ${v.toLocaleString("en-MU")}`;
}