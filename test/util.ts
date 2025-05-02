export const areMatricesClose = (a: ArrayLike<number>, b: ArrayLike<number>, epsilon = 1e-6): boolean => {
  if (a.length !== b.length) return false;
  return Array.from(a).every((val, i) => Math.abs(val - b[i]) <= epsilon);
};
